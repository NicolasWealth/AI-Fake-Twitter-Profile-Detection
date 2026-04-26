import pandas as pd
import numpy as np
from datetime import datetime, timezone

# Load raw merged data
df = pd.read_csv("data/processed_raw.csv")

# Safe numeric conversion
num_cols = [
    "followers_count",
    "following_count",
    "statuses_count",
    "favorites_count",
    "listed_count"
]

for col in num_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

# follower_following_ratio
df["follower_following_ratio"] = df["followers_count"] / (df["following_count"] + 1)

# created_at -> account_age_days
def calc_age(value):
    try:
        dt = pd.to_datetime(value, utc=True, errors="coerce")
        if pd.isna(dt):
            return 0
        now = pd.Timestamp.now(tz="UTC")
        return max((now - dt).days, 0)
    except:
        return 0

df["account_age_days"] = df["created_at"].apply(calc_age)

# posts_per_day
df["posts_per_day"] = df["statuses_count"] / (df["account_age_days"] + 1)

# booleans
df["has_profile_image"] = df["profile_image_url"].fillna("").astype(str).str.len().gt(0).astype(int)
df["has_default_profile"] = df["default_profile"].astype(str).str.lower().isin(["true","1"]).astype(int)
df["has_description"] = df["description"].fillna("").astype(str).str.strip().ne("").astype(int)
df["has_url"] = df["url"].fillna("").astype(str).str.strip().ne("").astype(int)

# username features
df["username"] = df["username"].fillna("").astype(str)

df["username_length"] = df["username"].str.len()

def randomness(name):
    if not name:
        return 0
    digits = sum(c.isdigit() for c in name)
    uppers = sum(c.isupper() for c in name)
    specials = sum(not c.isalnum() for c in name)
    return (digits + uppers + specials) / max(len(name), 1)

df["username_randomness_score"] = df["username"].apply(randomness)

# bio_length
df["bio_length"] = df["description"].fillna("").astype(str).str.len()

# Keep final schema
final_cols = [
    "followers_count",
    "following_count",
    "follower_following_ratio",
    "statuses_count",
    "favorites_count",
    "listed_count",
    "account_age_days",
    "posts_per_day",
    "has_profile_image",
    "has_default_profile",
    "has_description",
    "has_url",
    "username_length",
    "username_randomness_score",
    "bio_length",
    "label"
]

final_df = df[final_cols].copy()

final_df.to_csv("data/final_dataset.csv", index=False)

print("Final dataset created")
print("Rows:", len(final_df))
print("Columns:", len(final_df.columns))