from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import numpy as np

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

# Load model
bundle = joblib.load("data/models/best_model.pkl")

model = bundle["model"]
threshold = bundle["threshold"]

# Exact feature order the model was trained on
MODEL_FEATURES = [
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

# Input schema — accepts all extension fields, extras like username are ignored by model
class ScanInput(BaseModel):
    followers_count: int
    following_count: int
    follower_following_ratio: float
    account_age_days: int
    statuses_count: int
    posts_per_day: float
    content_density: float

    tweets_per_day: float
    engagement_proxy: float
    followers_log: float
    following_log: float
    ratio_log: float
    activity_score: float
    growth_signal: float

    has_profile_image: int
    verified: int
    bio_length: int
    username_randomness_score: float
    username_length: int

    username: str = ""  # passed through but not fed to model

@app.get("/")
def home():
    return {"status": "running"}

@app.post("/predict")
def predict(data: ScanInput):

    row = {k: getattr(data, k) for k in MODEL_FEATURES}
    df = pd.DataFrame([row])

    proba = model.predict_proba(df)[0][1]
    prediction = int(proba >= threshold)

    return {
        "prediction": prediction,
        "label": "fake" if prediction == 1 else "real",
        "fake_probability": round(float(proba), 4),
        "threshold": threshold
    }

    response = {
        "prediction": int(prediction),
        "label": "fake" if prediction == 1 else "real"
    }

    if hasattr(model, "predict_proba"):
        probability = model.predict_proba(df)[0][1]
        response["fake_probability"] = round(float(probability), 4)

    return response