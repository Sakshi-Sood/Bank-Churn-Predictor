# Bank Customer Churn Prediction

A full-stack machine learning application that predicts customer churn for banks using XGBoost, with an interactive React dashboard and FastAPI backend.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![XGBoost](https://img.shields.io/badge/XGBoost-ML-orange.svg)

## - Overview

This project predicts whether a bank customer will churn (leave the bank) based on various features like credit score, age, balance, and activity status. The application includes:

- **Machine Learning Model**: XGBoost classifier with 87% accuracy and 51.3% recall
- **Model Explainability**: SHAP values for understanding predictions
- **Interactive Dashboard**: React-based UI with Material-UI components
- **REST API**: FastAPI backend serving predictions and analytics

## - Features

### Prediction Tab

- Input customer details through an intuitive form
- Get churn probability with risk assessment
- View SHAP-based feature importance explaining why the prediction was made

### Analytics Tab

- Churn rate by Geography (France, Germany, Spain)
- Churn rate by Gender
- Active vs Inactive member churn comparison

### Model Performance Tab

- Comparison of 4 ML models (Logistic Regression, Random Forest, XGBoost, SVM)
- Confusion matrix visualization
- ROC curve with AUC score

## - Project Structure

```
Bank-Churn-Prediction/
├── api/                    # FastAPI backend
│   ├── main.py            # API endpoints
│   └── requirements.txt   # API dependencies
├── dashboard/             # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Navbar.js
│       │   ├── PredictionCard.js
│       │   ├── Analytics.js
│       │   └── ModelPerformance.js
│       ├── App.js
│       └── theme.js
├── data/
│   └── cleaned_churn_data.csv
├── models/
│   └── final_churn_model.pkl
├── notebooks/
│   ├── eda.ipynb          # Exploratory Data Analysis
│   └── training.ipynb     # Model Training
├── src/
│   ├── EDA.py
│   └── model_training.py
└── requirements.txt       # Python dependencies
```

## - Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sakshi-Sood/Bank-Churn-Prediction.git
   cd Bank-Churn-Prediction
   ```

2. **Set up Python environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Install dashboard dependencies**
   ```bash
   cd dashboard
   npm install
   ```

### Running the Application

1. **Start the API server**

   ```bash
   cd api
   uvicorn main:app --reload
   ```

   The API will be available at `http://127.0.0.1:8000`

2. **Start the React dashboard** (in a new terminal)
   ```bash
   cd dashboard
   npm start
   ```
   The dashboard will open at `http://localhost:3000`

## - Model Performance

| Model                  | Accuracy  | Recall    | AUC       |
| ---------------------- | --------- | --------- | --------- |
| Logistic Regression    | 81.1%     | 19.7%     | 0.760     |
| Random Forest          | 86.6%     | 46.7%     | 0.859     |
| **XGBoost** (Deployed) | **87.0%** | **51.3%** | **0.873** |
| SVM                    | 85.8%     | 42.3%     | 0.840     |

**Why XGBoost?** Selected for deployment due to highest recall (51.3%) - crucial for identifying at-risk customers before they churn.

## - API Endpoints

| Endpoint             | Method | Description                                 |
| -------------------- | ------ | ------------------------------------------- |
| `/predict`           | POST   | Get churn prediction with SHAP explanations |
| `/analytics`         | GET    | Retrieve analytics data for visualizations  |
| `/model-performance` | GET    | Get model comparison metrics                |
| `/docs`              | GET    | Swagger API documentation                   |

### Example Prediction Request

```json
POST /predict
{
  "CreditScore": 650,
  "Age": 35,
  "Tenure": 5,
  "Balance": 50000,
  "NumOfProducts": 2,
  "HasCrCard": 1,
  "IsActiveMember": 1,
  "EstimatedSalary": 75000,
  "Geography": "France",
  "Gender": "Male"
}
```

## - Technologies Used

### Backend

- **FastAPI** - High-performance Python web framework
- **XGBoost** - Gradient boosting ML model
- **SHAP** - Model interpretability
- **Pandas/NumPy** - Data processing
- **Scikit-learn** - Preprocessing pipeline

### Frontend

- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client

## - Dataset

The dataset contains 10,000 bank customers with the following features:

| Feature         | Description                     |
| --------------- | ------------------------------- |
| CreditScore     | Customer's credit score         |
| Age             | Customer's age                  |
| Tenure          | Years with the bank             |
| Balance         | Account balance                 |
| NumOfProducts   | Number of bank products         |
| HasCrCard       | Has credit card (0/1)           |
| IsActiveMember  | Active member (0/1)             |
| EstimatedSalary | Estimated annual salary         |
| Geography       | Country (France/Germany/Spain)  |
| Gender          | Male/Female                     |
| Exited          | Churned (1) or Not (0) - Target |

## - Contribution

Contributions are welcome! If you'd like to improve this project, feel free to fork the repository and submit a pull request. Please ensure your changes align with the project's objectives.

## - Author

**Sakshi Sood**

- GitHub: [@Sakshi-Sood](https://github.com/Sakshi-Sood)

If you found this project helpful, please give it a star!
