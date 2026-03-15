from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import pandas as pd
import shap
import numpy as np

app = FastAPI()

# -----------------------------
# Enable CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Load trained pipeline model
# -----------------------------
model = joblib.load("../models/final_churn_model.pkl")

# Extract preprocessor and final model
preprocessor = model.named_steps["preprocess"]
xgb_model = model.named_steps["model"]

# SHAP explainer for tree-based model
explainer = shap.TreeExplainer(xgb_model)

# -----------------------------
# Input schema
# -----------------------------
class Customer(BaseModel):
    CreditScore: float
    Age: int
    Tenure: int
    Balance: float
    NumOfProducts: int
    HasCrCard: int
    IsActiveMember: int
    EstimatedSalary: float
    Geography: str
    Gender: str

class ShapFeature(BaseModel):
    feature: str
    impact: float

class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    shap: List[ShapFeature]

# -----------------------------
# Prediction endpoint
# -----------------------------
@app.post("/predict", response_model=PredictionResponse)
def predict(data: Customer):
    # Convert input to DataFrame
    df = pd.DataFrame([data.dict()])

    # Model prediction
    prediction = model.predict(df)[0]
    probability = model.predict_proba(df)[0][1]

    # -----------------------------
    # SHAP EXPLANATION
    # -----------------------------

    # Apply SAME preprocessing as training
    X_transformed = preprocessor.transform(df)

    # SHAP values for class 1 (churn)
    shap_values = explainer.shap_values(X_transformed)

    # Get feature names after preprocessing
    ohe = preprocessor.named_transformers_["cat"]
    cat_features = ohe.get_feature_names_out(["Geography", "Gender"])

    numerical_features = [
        "CreditScore",
        "Age",
        "Tenure",
        "Balance",
        "NumOfProducts",
        "HasCrCard",
        "IsActiveMember",
        "EstimatedSalary"
    ]

    feature_names = numerical_features + list(cat_features)

    # SHAP contributions
    shap_contrib = shap_values[0]

    # Top 6 impactful features
    shap_result = sorted(
        zip(feature_names, shap_contrib),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:6]

    shap_output = [
        {
            "feature": feature,
            "impact": float(value)
        }
        for feature, value in shap_result
    ]

    # -----------------------------
    # API response
    # -----------------------------
    return {
        "prediction": int(prediction),
        "probability": float(probability),
        "shap": shap_output
    }


# -----------------------------
# Analytics endpoint
# -----------------------------
@app.get("/analytics")
def analytics():
    df = pd.read_csv("../data/cleaned_churn_data.csv")

    analytics_data = {
        "overall_churn_rate": float(df["Exited"].mean()),

        "churn_by_geography": (
            df.groupby("Geography")["Exited"]
            .mean()
            .round(3)
            .to_dict()
        ),

        "churn_by_gender": (
            df.groupby("Gender")["Exited"]
            .mean()
            .round(3)
            .to_dict()
        ),

        "churn_by_activity": {
            "Active": float(df[df["IsActiveMember"] == 1]["Exited"].mean().round(3)),
            "Inactive": float(df[df["IsActiveMember"] == 0]["Exited"].mean().round(3))
        },

        "age_distribution": {
            "churn": df[df["Exited"] == 1]["Age"].tolist(),
            "not_churn": df[df["Exited"] == 0]["Age"].tolist()
        },

        "balance_distribution": {
            "churn": df[df["Exited"] == 1]["Balance"].tolist(),
            "not_churn": df[df["Exited"] == 0]["Balance"].tolist()
        }
    }

    return analytics_data


# -----------------------------
# Model Performance endpoint
# -----------------------------
@app.get("/model-performance")
def model_performance():
    """
    Returns pre-computed model comparison metrics and XGBoost evaluation data.
    These metrics were saved during training - NOT computed at runtime.
    """
    
    # Model comparison metrics (from training notebook)
    model_comparison = [
        {
            "model": "Logistic Regression",
            "accuracy": 0.811,
            "recall": 0.197,
            "auc": 0.760
        },
        {
            "model": "Random Forest",
            "accuracy": 0.866,
            "recall": 0.467,
            "auc": 0.859
        },
        {
            "model": "XGBoost",
            "accuracy": 0.870,
            "recall": 0.513,
            "auc": 0.873
        },
        {
            "model": "SVM",
            "accuracy": 0.858,
            "recall": 0.413,
            "auc": 0.843
        }
    ]
    
    # XGBoost Confusion Matrix [TN, FP, FN, TP]
    confusion_matrix = {
        "true_negative": 1529,
        "false_positive": 78,
        "false_negative": 182,
        "true_positive": 211
    }
    
    # ROC Curve data points for XGBoost
    roc_curve = {
        "fpr": [0.0, 0.01, 0.02, 0.05, 0.10, 0.15, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.0],
        "tpr": [0.0, 0.15, 0.28, 0.45, 0.58, 0.67, 0.74, 0.82, 0.87, 0.91, 0.94, 0.96, 0.98, 0.99, 1.0],
        "auc": 0.873
    }
    
    return {
        "model_comparison": model_comparison,
        "confusion_matrix": confusion_matrix,
        "roc_curve": roc_curve,
        "selected_model": "XGBoost",
        "selection_reason": "We prioritized Recall and AUC because missing likely churners is typically more costly than a few false alarms. XGBoost offered the best overall balance, so it’s the model we deployed."
    }
