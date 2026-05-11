import joblib
import math
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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bundle = joblib.load("data/models/best_model.pkl")
model = bundle["model"]
threshold = float(bundle.get("threshold", 0.5))
MODEL_FEATURES = bundle.get("features", DEFAULT_MODEL_FEATURES)


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


class AccountData(BaseModel):
    followers_count: float
    following_count: float
    account_age_days: float
    statuses_count: float
    has_profile_image: int
    verified: int
    bio_length: float
    username_randomness_score: float
    username_length: float
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


@app.post("/predict")
def predict(data: AccountData):
    df = build_feature_frame(data)
    proba = float(model.predict_proba(df)[0][1])
    prediction = int(proba >= threshold)
    label = "fake" if prediction == 1 else "real"

    return {
        "prediction": label,
        "prediction_int": prediction,
        "label": label,
        "fake_probability": proba,
        "probability": proba,
        "threshold": threshold
    }
