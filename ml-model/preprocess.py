import pandas as pd
import os

# Paths
# NOTE: despite the .csv extension, the file is actually an Excel workbook (.xlsx)
INPUT_FILE = "data/raw/dataset.csv"
OUTPUT_DIR = "data/processed"
OUTPUT_FILE = f"{OUTPUT_DIR}/clean_dataset.csv"

os.makedirs(OUTPUT_DIR, exist_ok=True)

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

# Compute content_density BEFORE filling NaN (uses already-renamed columns)
df["content_density"] = (
    df["statuses_count"] / df["account_age_days"].replace(0, 1)
).fillna(0)

# Fill missing values for numeric columns
numeric_cols = [
    "followers_count",
    "following_count",
    "follower_following_ratio",
    "account_age_days",
    "statuses_count",
    "posts_per_day",
    "content_density",
    "bio_length",
    "username_randomness_score",
    "username_length"
]

for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")
    df[col] = df[col].fillna(df[col].median())

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