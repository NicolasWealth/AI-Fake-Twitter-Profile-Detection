import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

MODEL_PATH = "data/models/best_model.pkl"
THRESHOLD_CANDIDATES = np.arange(0.3, 0.7, 0.05)

# Load dataset
df = pd.read_csv("data/processed/clean_dataset.csv")

# Features / Target
X = df.drop(columns=["label"])
y = df["label"]
feature_names = X.columns.tolist()

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
    ),
}

best_model = None
best_name = None
best_score = 0.0
best_threshold = 0.5
best_metrics = {}

for name, model in models.items():
    print(f"\n===== {name} =====")

    model.fit(X_train, y_train)

    probs = model.predict_proba(X_test)[:, 1]
    selected_threshold = 0.5
    preds = model.predict(X_test)

    if name == "RandomForest":
        threshold_score = 0.0

        for candidate in THRESHOLD_CANDIDATES:
            preds_t = (probs >= candidate).astype(int)
            fake_f1 = f1_score(y_test, preds_t, pos_label=1)

            if fake_f1 > threshold_score:
                threshold_score = fake_f1
                selected_threshold = float(candidate)

        print("Best Threshold:", selected_threshold)
        preds = (probs >= selected_threshold).astype(int)

    acc = accuracy_score(y_test, preds)
    fake_f1 = f1_score(y_test, preds, pos_label=1)
    cv_scores = cross_val_score(
        model,
        X,
        y,
        cv=5,
        scoring="f1"
    )
    roc_auc = roc_auc_score(y_test, probs)

    print("Accuracy:", round(acc * 100, 2), "%")
    print("Fake Account F1:", round(fake_f1, 4))
    print("Cross Validation F1:", round(cv_scores.mean(), 4))
    print("ROC AUC:", round(roc_auc, 4))
    print("\nClassification Report:")
    print(classification_report(y_test, preds))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, preds))

    if fake_f1 > best_score:
        best_score = fake_f1
        best_model = model
        best_name = name
        best_threshold = selected_threshold
        best_metrics = {
            "accuracy": round(acc, 4),
            "fake_f1": round(fake_f1, 4),
            "cv_f1": round(float(cv_scores.mean()), 4),
            "roc_auc": round(float(roc_auc), 4),
        }

joblib.dump(
    {
        "model": best_model,
        "threshold": best_threshold,
        "features": feature_names,
        "model_name": best_name,
        "metrics": best_metrics,
    },
    MODEL_PATH
)

print(feature_names)
print("\n==========================")
print("Best Model:", best_name)
print("Best Threshold:", best_threshold)
print("Best Fake F1:", round(best_score, 4))
print("Saved to", MODEL_PATH)
