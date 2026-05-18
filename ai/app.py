import joblib
import math
import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DEFAULT_MODEL_FEATURES = [
    "followers_count",
    "following_count",
    "follower_following_ratio",
    "account_age_days",
    "statuses_count",
    "posts_per_day",
    "content_density",
    "tweets_per_day",
    "engagement_proxy",
    "followers_log",
    "following_log",
    "ratio_log",
    "activity_score",
    "growth_signal",
    "has_profile_image",
    "verified",
    "bio_length",
    "username_randomness_score",
    "username_length",
]

FEATURE_BOUNDS = {
    "followers_count": (0, 1000000000),
    "following_count": (0, 1000000),
    "follower_following_ratio": (0, 1000),
    "posts_per_day": (0, 500),
    "content_density": (0, 500),
    "tweets_per_day": (0, 500),
    "engagement_proxy": (0, 100000000),
    "activity_score": (0, 500),
    "growth_signal": (0, 1000000),
}

app = FastAPI(
    title="Fake Profile Detection AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "data", "models", "best_model.pkl")
bundle = joblib.load(MODEL_PATH)
model = bundle["model"]
threshold = float(bundle.get("threshold", 0.5))
MODEL_FEATURES = bundle.get("features", DEFAULT_MODEL_FEATURES)
MODEL_NAME = bundle.get("model_name", type(model).__name__)


def clamp(value, lower, upper):
    return min(max(value, lower), upper)


def to_number(value):
    try:
        number = float(value)
        return number if math.isfinite(number) else 0.0
    except (TypeError, ValueError):
        return 0.0


def non_negative(value):
    return max(0.0, to_number(value))


def bounded_number(value, field):
    lower, upper = FEATURE_BOUNDS[field]
    return clamp(to_number(value), lower, upper)


def round_feature(value):
    return round(value, 4) if math.isfinite(value) else 0.0


def build_feature_row(data):
    followers = bounded_number(data.followers_count, "followers_count")
    following = bounded_number(data.following_count, "following_count")
    account_age_days = non_negative(data.account_age_days)
    statuses_count = non_negative(data.statuses_count)

    posts_per_day = round_feature(clamp(
        statuses_count / (account_age_days + 1),
        *FEATURE_BOUNDS["posts_per_day"]
    ))
    content_density = round_feature(clamp(
        statuses_count / max(account_age_days, 1),
        *FEATURE_BOUNDS["content_density"]
    ))
    tweets_per_day = round_feature(clamp(
        statuses_count / (account_age_days + 1),
        *FEATURE_BOUNDS["tweets_per_day"]
    ))
    engagement_proxy = round_feature(clamp(
        followers * tweets_per_day,
        *FEATURE_BOUNDS["engagement_proxy"]
    ))
    followers_log = round_feature(math.log1p(followers))
    following_log = round_feature(math.log1p(following))
    ratio_log = round_feature(followers_log / (following_log + 1))
    activity_score = round_feature(clamp(
        statuses_count / (account_age_days + 1),
        *FEATURE_BOUNDS["activity_score"]
    ))
    growth_signal = round_feature(clamp(
        followers / (account_age_days + 1),
        *FEATURE_BOUNDS["growth_signal"]
    ))

    return {
        "followers_count": followers,
        "following_count": following,
        "follower_following_ratio": round_feature(clamp(
            followers / (following + 1),
            *FEATURE_BOUNDS["follower_following_ratio"]
        )),
        "account_age_days": account_age_days,
        "statuses_count": statuses_count,
        "posts_per_day": posts_per_day,
        "content_density": content_density,
        "tweets_per_day": tweets_per_day,
        "engagement_proxy": engagement_proxy,
        "followers_log": followers_log,
        "following_log": following_log,
        "ratio_log": ratio_log,
        "activity_score": activity_score,
        "growth_signal": growth_signal,
        "has_profile_image": int(clamp(to_number(data.has_profile_image), 0, 1)),
        "verified": int(clamp(to_number(data.verified), 0, 1)),
        "bio_length": non_negative(data.bio_length),
        "username_randomness_score": clamp(
            to_number(data.username_randomness_score),
            0,
            1
        ),
        "username_length": non_negative(data.username_length),
    }


def build_feature_frame(data):
    row = build_feature_row(data)
    return pd.DataFrame(
        [[row.get(feature, 0) for feature in MODEL_FEATURES]],
        columns=MODEL_FEATURES
    )


def build_risk_level(probability):
    score = probability * 100

    if score >= 85:
        return "Critical"

    if score >= 70:
        return "High"

    if score >= 50:
        return "Medium"

    return "Low"


def build_explanation(row, probability):
    reasons = []

    if row["follower_following_ratio"] >= 1000:
        reasons.append("Extremely high follower ratio")

    if row["username_randomness_score"] > 0.4:
        reasons.append("Username randomness detected")

    if row["has_profile_image"] == 0:
        reasons.append("Missing profile image")

    if row["bio_length"] < 10:
        reasons.append("Very short biography")

    if row["content_density"] > 50:
        reasons.append("Abnormal posting activity")

    if row["tweets_per_day"] > 50 or row["activity_score"] > 50:
        reasons.append("Very high daily posting volume")

    if row["growth_signal"] < 0.5 and row["account_age_days"] > 180:
        reasons.append("Weak follower growth for account age")

    if row["engagement_proxy"] > 1000000 and row["verified"] == 0:
        reasons.append("Large reach proxy without verification")

    if row["ratio_log"] > 2.5 and row["following_count"] < 20:
        reasons.append("Highly lopsided follower pattern")

    if row["verified"] == 0 and row["followers_count"] > 1000000:
        reasons.append("Large audience without verification")

    if not reasons and probability >= 0.5:
        reasons.append(
            "Several account signals differ from typical real profiles"
        )

    return reasons


class ScanInput(BaseModel):
    followers_count: int
    following_count: int
    account_age_days: int
    statuses_count: int
    has_profile_image: int
    verified: int
    bio_length: int
    username_randomness_score: float
    username_length: int
    follower_following_ratio: float = 0.0
    posts_per_day: float = 0.0
    content_density: float = 0.0
    tweets_per_day: float = 0.0
    engagement_proxy: float = 0.0
    followers_log: float = 0.0
    following_log: float = 0.0
    ratio_log: float = 0.0
    activity_score: float = 0.0
    growth_signal: float = 0.0
    username: str = ""


@app.get("/")
def health():
    return {
        "status": "online",
        "service": "Fake Profile Detection AI",
        "model": MODEL_NAME,
        "model_name": MODEL_NAME,
        "feature_count": len(MODEL_FEATURES)
    }


@app.post("/predict")
def predict(data: ScanInput):
    feature_row = build_feature_row(data)
    df = pd.DataFrame(
        [[feature_row.get(feature, 0) for feature in MODEL_FEATURES]],
        columns=MODEL_FEATURES
    )
    proba = round(float(model.predict_proba(df)[0][1]), 4)
    prediction = int(proba >= threshold)
    confidence = round(proba if prediction == 1 else 1 - proba, 4)
    risk_level = build_risk_level(proba)
    explanation = build_explanation(feature_row, proba)

    return {
        "prediction": prediction,
        "label": "fake" if prediction == 1 else "real",
        "fake_probability": proba,
        "probability": proba,
        "threshold": threshold,
        "model_name": MODEL_NAME,
        "confidence": confidence,
        "risk_level": risk_level,
        "explanation": explanation,
        "features": feature_row
    }
