import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Load processed dataset
df = pd.read_csv("data/processed/clean_dataset.csv")

# Split features and target
X = df.drop("label", axis=1)
y = df["label"]

# Train / test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Model
model = RandomForestClassifier(
    n_estimators=500,
    max_depth=12,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train, y_train)

# Predict
preds = model.predict(X_test)

# Metrics
acc = accuracy_score(y_test, preds)

print("Accuracy:", round(acc * 100, 2), "%")
print()
print("Confusion Matrix:")
print(confusion_matrix(y_test, preds))
print()
print("Classification Report:")
print(classification_report(y_test, preds))

# Save model
joblib.dump(model, "data/models/model.pkl")

print("Saved model to data/models/model.pkl")