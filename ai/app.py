from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib

app = FastAPI(
    title="Fake Profile Detection AI",
    version="1.0.0"
)

# Allow extension / frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
model = joblib.load("data/models/best_model.pkl")

# Input schema
class ScanInput(BaseModel):
    followers_count: int
    following_count: int
    follower_following_ratio: float
    account_age_days: int
    statuses_count: int
    posts_per_day: float
    has_profile_image: int
    verified: int
    bio_length: int
    username_randomness_score: float
    username_length: int

@app.get("/")
def home():
    return {"status": "running"}

@app.post("/predict")
def predict(data: ScanInput):
    df = pd.DataFrame([data.dict()])

    prediction = model.predict(df)[0]

    response = {
        "prediction": int(prediction),
        "label": "fake" if prediction == 1 else "real"
    }

    if hasattr(model, "predict_proba"):
        probability = model.predict_proba(df)[0][1]
        response["fake_probability"] = round(float(probability), 4)

    return response