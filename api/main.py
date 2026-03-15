from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from pathlib import Path
import json
import joblib
import pandas as pd
import shap
import numpy as np

app = FastAPI()


@app.get("/")
def root():
    return {
        "message": "Bank Churn Predictor API is running",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }


@app.get("/health")
def health():
    return {"status": "ok"}

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
    transformed_input = preprocessor.transform(df)

    # SHAP values for class 1 (churn)
    shap_values = explainer.shap_values(transformed_input)

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
@app.get(
    "/model-performance",
    responses={
        500: {
            "description": "Model performance JSON is missing or invalid"
        }
    },
)
def model_performance():
    

    metrics_file = Path(__file__).resolve().parent.parent / "data" / "model_performance.json"

    try:
        with metrics_file.open("r", encoding="utf-8") as file:
            return json.load(file)
    except FileNotFoundError:
        return JSONResponse(status_code=500, content={"detail": "model_performance.json not found"})
    except json.JSONDecodeError:
        return JSONResponse(status_code=500, content={"detail": "model_performance.json is invalid"})
