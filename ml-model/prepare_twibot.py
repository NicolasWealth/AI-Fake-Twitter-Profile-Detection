import json
import pandas as pd

# Load label file
labels = pd.read_csv("data/raw/label.csv")

# Load user data
with open("data/raw/list.json", "r") as f:
    data = json.load(f)

# Convert JSON to DataFrame
users = []

for user_id, user_data in data.items():
    user = {}

    user["id"] = user_id
    user["followers_count"] = user_data.get("followers_count", 0)
    user["following_count"] = user_data.get("friends_count", 0)
    user["statuses_count"] = user_data.get("statuses_count", 0)
    user["favorites_count"] = user_data.get("favourites_count", 0)
    user["listed_count"] = user_data.get("listed_count", 0)

    user["description"] = user_data.get("description", "")
    user["url"] = user_data.get("url", "")
    user["default_profile"] = user_data.get("default_profile", False)
    user["profile_image_url"] = user_data.get("profile_image_url", "")

    user["created_at"] = user_data.get("created_at", "")

    users.append(user)

df_users = pd.DataFrame(users)

# Merge with labels
df = df_users.merge(labels, on="id")

print("Merged dataset shape:", df.shape)

df.to_csv("data/processed_raw.csv", index=False)

print("Saved raw merged dataset")
