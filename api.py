import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI()

# Load model package
bundle = joblib.load("data/models/best_model.pkl")

model = bundle["model"]
threshold = bundle["threshold"]

# Define input schema
class AccountData(BaseModel):
    followers_count: float
    following_count: float
    follower_following_ratio: float
    account_age_days: float
    statuses_count: float
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
    bio_length: float
    username_randomness_score: float
    username_length: float


@app.post("/predict")
def predict(data: AccountData):

    features = np.array([[
        data.followers_count,
        data.following_count,
        data.follower_following_ratio,
        data.account_age_days,
        data.statuses_count,
        data.posts_per_day,
        data.content_density,
        data.tweets_per_day,
        data.engagement_proxy,
        data.followers_log,
        data.following_log,
        data.ratio_log,
        data.activity_score,
        data.growth_signal,
        data.has_profile_image,
        data.verified,
        data.bio_length,
        data.username_randomness_score,
        data.username_length
    ]])

    proba = model.predict_proba(features)[0][1]
    prediction = int(proba >= threshold)

    return {
        "prediction": "fake" if prediction == 1 else "real",
        "probability": float(proba),
        "threshold": threshold
    }