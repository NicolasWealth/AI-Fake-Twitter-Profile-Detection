import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, f1_score

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# Load dataset
df = pd.read_csv("data/processed/clean_dataset.csv")

# Features / Target
X = df.drop("label", axis=1)
y = df["label"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Models
models = {
    "RandomForest": RandomForestClassifier(
        n_estimators=500,
        max_depth=12,
        class_weight="balanced",
        random_state=42
    ),

    "GradientBoosting": GradientBoostingClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=3,
        random_state=42
    ),

    "LogisticRegression": make_pipeline(
        StandardScaler(),
        LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            random_state=42
        )
    )
}

best_model = None
best_name = None
best_score = 0

for name, model in models.items():
    print(f"\n===== {name} =====")

    model.fit(X_train, y_train)
    preds = model.predict(X_test)

    acc = accuracy_score(y_test, preds)
    fake_f1 = f1_score(y_test, preds, pos_label=1)

    print("Accuracy:", round(acc * 100, 2), "%")
    print("Fake Account F1:", round(fake_f1, 4))
    print(classification_report(y_test, preds))

    # prioritize fake account detection
    score = fake_f1

    if score > best_score:
        best_score = score
        best_model = model
        best_name = name

# Save best model
joblib.dump(best_model, "data/models/best_model.pkl")

print(df.columns.tolist())
print("\n==========================")
print("Best Model:", best_name)
print("Best Fake F1:", round(best_score, 4))
print("Saved to data/models/best_model.pkl")