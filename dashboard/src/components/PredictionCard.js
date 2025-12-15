import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Button,
    LinearProgress,
    Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PublicIcon from "@mui/icons-material/Public";
import axios from "axios";
import { useState } from "react";

export default function PredictionCard() {
    const [formData, setFormData] = useState({
        Geography: "France",
        Gender: "Male",
        Age: "",
        Tenure: "",
        Balance: "",
        NumOfProducts: "",
        CreditScore: "",
        EstimatedSalary: "",
        HasCrCard: 1,
        IsActiveMember: 1
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value
        });
    };

    const handlePredict = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/predict",
                {
                    ...formData,
                    Age: Number(formData.Age),
                    Tenure: Number(formData.Tenure),
                    Balance: Number(formData.Balance),
                    NumOfProducts: Number(formData.NumOfProducts),
                    CreditScore: Number(formData.CreditScore),
                    EstimatedSalary: Number(formData.EstimatedSalary)
                }
            );

            setResult(response.data);
            console.log("API RESULT:", response.data);

        } catch (err) {
            alert("Prediction failed. Is FastAPI running?");
        }

        setLoading(false);
    };

    const riskLabel = result
        ? result.probability >= 0.7
            ? "High Risk"
            : result.probability >= 0.4
                ? "Medium Risk"
                : "Low Risk"
        : null;

    const inputStyle = {
        "& .MuiOutlinedInput-root": {
            backgroundColor: "#334155",
            borderRadius: 1,
            "& fieldset": {
                borderColor: "transparent",
            },
            "&:hover fieldset": {
                borderColor: "#6366f1",
            },
        },
    };

    // Feature label mapping for business-friendly names
    const featureLabelMap = {
        Age: "Age",
        Balance: "Account Balance",
        NumOfProducts: "Number of Products",
        IsActiveMember: "Active Membership",
        Gender_Male: "Gender: Male",
        Gender_Female: "Gender: Female",
        Tenure: "Tenure",
        CreditScore: "Credit Score",
        EstimatedSalary: "Estimated Salary",
        HasCrCard: "Has Credit Card",
        Geography_France: "Geography: France",
        Geography_Germany: "Geography: Germany",
        Geography_Spain: "Geography: Spain"
    };

    // Group SHAP values into increasing and reducing churn
    const getGroupedShap = () => {
        if (!result?.shap) return { increasing: [], reducing: [] };

        const increasing = result.shap
            .filter(item => item.impact > 0)
            .sort((a, b) => b.impact - a.impact);

        const reducing = result.shap
            .filter(item => item.impact <= 0)
            .sort((a, b) => a.impact - b.impact);

        return { increasing, reducing };
    };

    return (
        <>
            <Card sx={{ background: "#1e293b", borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                    {/* Header with Search Icon */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                        <SearchIcon sx={{ fontSize: 24, mr: 1, color: "white" }} />
                        <Typography variant="h6" fontWeight="bold">
                            Customer Information
                        </Typography>
                    </Box>

                    {/* Row 1: Geography, Gender */}
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="gray" sx={{ mb: 0.5 }}>
                                Geography
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                name="Geography"
                                value={formData.Geography}
                                onChange={handleChange}
                                size="small"
                                sx={inputStyle}
                            >
                                <MenuItem value="France">France</MenuItem>
                                <MenuItem value="Germany">Germany</MenuItem>
                                <MenuItem value="Spain">Spain</MenuItem>
                            </TextField>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="gray" sx={{ mb: 0.5 }}>
                                Gender
                            </Typography>
                            <TextField
                                select
                                fullWidth
                                name="Gender"
                                value={formData.Gender}
                                onChange={handleChange}
                                size="small"
                                sx={inputStyle}
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                            </TextField>
                        </Box>
                    </Box>

                    {/* Row 2: Age, Tenure */}
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="gray" sx={{ mb: 0.5 }}>
                                Age
                            </Typography>
                            <TextField
                                fullWidth
                                name="Age"
                                value={formData.Age}
                                onChange={handleChange}
                                placeholder="Enter age"
                                size="small"
                                sx={inputStyle}
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="gray" sx={{ mb: 0.5 }}>
                                Tenure (years)
                            </Typography>
                            <TextField
                                fullWidth
                                name="Tenure"
                                value={formData.Tenure}
                                onChange={handleChange}
                                placeholder="Enter tenure"
                                size="small"
                                sx={inputStyle}
                            />
                        </Box>
                    </Box>

                    {/* Row 3: Account Balance (full width) */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="gray" sx={{ mb: 0.5 }}>
                            Account Balance ($)
                        </Typography>
                        <TextField
                            fullWidth
                            name="Balance"
                            value={formData.Balance}
                            onChange={handleChange}
                            placeholder="Enter account balance"
                            size="small"
                            sx={inputStyle}
                        />
                    </Box>

                    {/* Row 4: Number of Products, Credit Score */}
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="gray" sx={{ mb: 0.5 }}>
                                Number of Products
                            </Typography>
                            <TextField
                                fullWidth
                                name="NumOfProducts"
                                value={formData.NumOfProducts}
                                onChange={handleChange}
                                placeholder="Enter number of products"
                                size="small"
                                sx={inputStyle}
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="gray" sx={{ mb: 0.5 }}>
                                Credit Score
                            </Typography>
                            <TextField
                                fullWidth
                                name="CreditScore"
                                type="number"
                                inputProps={{ min: 300, max: 900 }}
                                value={formData.CreditScore}
                                onChange={handleChange}
                                placeholder="300–900"
                                size="small"
                                sx={inputStyle}
                            />
                        </Box>
                    </Box>

                    {/* Row 5: Estimated Salary (full width) */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="gray" sx={{ mb: 0.5 }}>
                            Estimated Salary ($)
                        </Typography>
                        <TextField
                            fullWidth
                            name="EstimatedSalary"
                            value={formData.EstimatedSalary}
                            onChange={handleChange}
                            placeholder="Enter estimated salary"
                            size="small"
                            sx={inputStyle}
                        />
                    </Box>

                    {/* Row 6: Checkboxes */}
                    <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.HasCrCard === 1}
                                    onChange={handleChange}
                                    name="HasCrCard"
                                    sx={{
                                        color: "#6366f1",
                                        "&.Mui-checked": {
                                            color: "#6366f1",
                                        },
                                    }}
                                />
                            }
                            label="Has Credit Card"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.IsActiveMember === 1}
                                    onChange={handleChange}
                                    name="IsActiveMember"
                                    sx={{
                                        color: "#6366f1",
                                        "&.Mui-checked": {
                                            color: "#6366f1",
                                        },
                                    }}
                                />
                            }
                            label="Active Member"
                        />
                    </Box>

                    {/* Row 7: Button */}
                    <Button
                        fullWidth
                        size="large"
                        onClick={handlePredict}
                        startIcon={<PublicIcon />}
                        sx={{
                            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)",
                            color: "white",
                            py: 1.5,
                            borderRadius: 1,
                            textTransform: "none",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            "&:hover": {
                                background: "linear-gradient(90deg, #4f46e5, #7c3aed, #9333ea)",
                            },
                        }}
                    >
                        Predict Churn Risk
                    </Button>
                </CardContent>
            </Card>

            {/* Loading indicator */}
            {loading && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}

            {/* Result display - Outside the form card */}
            {result && (
                <Card sx={{ background: "#1e293b", borderRadius: 2, mt: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold">
                            Prediction: {result.prediction === 1 ? "Churn" : "Not Churn"}
                        </Typography>

                        <Typography color="gray" sx={{ mt: 1 }}>
                            Probability: {(result.probability * 100).toFixed(2)}%
                        </Typography>

                        <Chip
                            label={riskLabel}
                            color={
                                riskLabel === "High Risk"
                                    ? "error"
                                    : riskLabel === "Medium Risk"
                                        ? "warning"
                                        : "success"
                            }
                            sx={{ mt: 1.5 }}
                        />
                    </CardContent>
                </Card>
            )}

            {/* SHAP Visualization - Outside the form card */}
            {result?.shap && (
                <Card sx={{ background: "#1e293b", borderRadius: 2, mt: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Why this prediction?
                        </Typography>

                        {/* Factors Increasing Churn */}
                        {getGroupedShap().increasing.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                                    <Box sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        backgroundColor: "#ef4444",
                                        mr: 1
                                    }} />
                                    <Typography variant="subtitle2" sx={{ color: "#ef4444", fontWeight: "bold" }}>
                                        Factors Increasing Churn
                                    </Typography>
                                </Box>
                                {getGroupedShap().increasing.map((item, idx) => {
                                    const barWidth = Math.min(Math.abs(item.impact) * 100, 100);
                                    return (
                                        <Box key={idx} sx={{ mb: 1.5 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography variant="body2" color="white">
                                                    {featureLabelMap[item.feature] || item.feature}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "#ef4444" }}>
                                                    ↑ +{(item.impact * 100).toFixed(1)}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                height: 8,
                                                borderRadius: 1,
                                                backgroundColor: "#334155",
                                                mt: 0.5,
                                                overflow: "hidden",
                                            }}>
                                                <Box sx={{
                                                    height: "100%",
                                                    width: `${barWidth}%`,
                                                    backgroundColor: "#ef4444",
                                                    borderRadius: 1,
                                                }} />
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                        {/* Factors Reducing Churn */}
                        {getGroupedShap().reducing.length > 0 && (
                            <Box>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                                    <Box sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        backgroundColor: "#22c55e",
                                        mr: 1
                                    }} />
                                    <Typography variant="subtitle2" sx={{ color: "#22c55e", fontWeight: "bold" }}>
                                        Factors Reducing Churn
                                    </Typography>
                                </Box>
                                {getGroupedShap().reducing.map((item, idx) => {
                                    const barWidth = Math.min(Math.abs(item.impact) * 100, 100);
                                    return (
                                        <Box key={idx} sx={{ mb: 1.5 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                                <Typography variant="body2" color="white">
                                                    {featureLabelMap[item.feature] || item.feature}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: "#22c55e" }}>
                                                    ↓ {(item.impact * 100).toFixed(1)}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{
                                                height: 8,
                                                borderRadius: 1,
                                                backgroundColor: "#334155",
                                                mt: 0.5,
                                                overflow: "hidden",
                                            }}>
                                                <Box sx={{
                                                    height: "100%",
                                                    width: `${barWidth}%`,
                                                    backgroundColor: "#22c55e",
                                                    borderRadius: 1,
                                                }} />
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    );
}
