import pandas as pd
import os
import numpy as np

# Paths
# NOTE: despite the .csv extension, the file is actually an Excel workbook (.xlsx)
INPUT_FILE = "data/raw/dataset.csv"
OUTPUT_DIR = "data/processed"
OUTPUT_FILE = f"{OUTPUT_DIR}/clean_dataset.csv"

os.makedirs(OUTPUT_DIR, exist_ok=True)

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


def clip_numeric(series, lower=0, upper=None):
    numeric = pd.to_numeric(series, errors="coerce").fillna(0)
    return numeric.clip(lower=lower, upper=upper)

# Load dataset — must use read_excel because the file is an xlsx file
df = pd.read_excel(INPUT_FILE)

print("Original Shape:", df.shape)

# Keep only needed columns (confirmed present in the source file)
required_columns = [
    "followers",
    "following",
    "follower_following_ratio",
    "account_age_days",
    "posts",
    "posts_per_day",
    "has_profile_pic",
    "verified",
    "bio_length",
    "username_randomness",
    "username_length",
    "is_fake"
]

df = df[required_columns]

# Rename columns to project schema
df = df.rename(columns={
    "followers": "followers_count",
    "following": "following_count",
    "posts": "statuses_count",
    "has_profile_pic": "has_profile_image",
    "username_randomness": "username_randomness_score",
    "is_fake": "label"
})

df["followers_count"] = clip_numeric(
    df["followers_count"],
    *FEATURE_BOUNDS["followers_count"]
)
df["following_count"] = clip_numeric(
    df["following_count"],
    *FEATURE_BOUNDS["following_count"]
)
df["account_age_days"] = clip_numeric(df["account_age_days"], 0)
df["statuses_count"] = clip_numeric(df["statuses_count"], 0)
df["bio_length"] = clip_numeric(df["bio_length"], 0)
df["username_randomness_score"] = clip_numeric(
    df["username_randomness_score"],
    0,
    1
)
df["username_length"] = clip_numeric(df["username_length"], 0)

df["follower_following_ratio"] = clip_numeric(
    df["followers_count"] / (df["following_count"] + 1),
    *FEATURE_BOUNDS["follower_following_ratio"]
)

df["posts_per_day"] = clip_numeric(
    df["statuses_count"] / (df["account_age_days"] + 1),
    *FEATURE_BOUNDS["posts_per_day"]
)

df["content_density"] = clip_numeric(
    df["statuses_count"] / df["account_age_days"].replace(0, 1),
    *FEATURE_BOUNDS["content_density"]
)

df["tweets_per_day"] = clip_numeric(
    df["statuses_count"] / (df["account_age_days"] + 1),
    *FEATURE_BOUNDS["tweets_per_day"]
)

df["engagement_proxy"] = clip_numeric(
    df["followers_count"] * df["tweets_per_day"],
    *FEATURE_BOUNDS["engagement_proxy"]
)

df["followers_log"] = np.log1p(df["followers_count"])
df["following_log"] = np.log1p(df["following_count"])
df["ratio_log"] = df["followers_log"] / (df["following_log"] + 1)

df["activity_score"] = clip_numeric(
    df["statuses_count"] / (df["account_age_days"] + 1),
    *FEATURE_BOUNDS["activity_score"]
)

df["growth_signal"] = clip_numeric(
    df["followers_count"] / (df["account_age_days"] + 1),
    *FEATURE_BOUNDS["growth_signal"]
)

# Fill missing values for numeric columns
numeric_cols = [
    "followers_count",
    "following_count",
    "follower_following_ratio",
    "account_age_days",
    "statuses_count",
    "posts_per_day",
    "content_density",

    # NEW FEATURES
    "tweets_per_day",
    "engagement_proxy",
    "followers_log",
    "following_log",
    "ratio_log",
    "activity_score",
    "growth_signal",

    "bio_length",
    "username_randomness_score",
    "username_length"
]

df = df.replace([np.inf, -np.inf], 0)

for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")
    df[col] = df[col].fillna(0)

# Binary columns
binary_cols = [
    "has_profile_image",
    "verified",
    "label"
]

for col in binary_cols:
    df[col] = df[col].fillna(0)
    df[col] = df[col].astype(int)

print("Clean Shape:", df.shape)
print(df.columns.tolist())

# Enforce exact column order to match MODEL_FEATURES in app.py
FINAL_COLS = [
    "followers_count",
    "following_count",
    "follower_following_ratio",
    "account_age_days",
    "statuses_count",
    "posts_per_day",
    "content_density",

    # NEW FEATURES (add these)
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

    "label",
]
df = df[FINAL_COLS]

print("Final columns:", df.columns.tolist())
df.to_csv(OUTPUT_FILE, index=False)
print("Saved:", OUTPUT_FILE)
