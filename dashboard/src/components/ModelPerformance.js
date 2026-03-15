import { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from "@mui/material";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";
import axios from "axios";

export default function ModelPerformance() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get("https://bank-churn-predictor-q01c.onrender.com/model-performance")
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress sx={{ color: "#6366f1" }} />
            </Box>
        );
    }

    if (!data) {
        return (
            <Typography color="error" sx={{ textAlign: "center", py: 5 }}>
                Failed to load model performance data.
            </Typography>
        );
    }

    const { model_comparison, confusion_matrix, roc_curve } = data;

    const selectedModelName = "XGBoost";
    const selectedModel =
        model_comparison?.find((row) => row.model === selectedModelName) ?? null;

    // Prepare ROC curve data
    const rocData = roc_curve.fpr.map((fpr, index) => ({
        fpr: fpr,
        tpr: roc_curve.tpr[index],
    }));

    // Diagonal line for ROC
    const diagonalData = [
        { fpr: 0, tpr: 0 },
        { fpr: 1, tpr: 1 },
    ];

    // Confusion matrix values
    const { true_negative, false_positive, false_negative, true_positive } = confusion_matrix;
    const total = true_negative + false_positive + false_negative + true_positive;

    return (
        <Box>
            {/* Header */}
            <Card sx={{ background: "#1e293b", borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <AutoGraphIcon sx={{ fontSize: 24, mr: 1, color: "white" }} />
                        <Typography variant="h6" fontWeight="bold">
                            Model Performance
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            background: "rgba(51, 65, 85, 0.45)",
                            borderRadius: 1,
                            p: 2,
                            border: "1px solid #334155",
                            borderLeft: "4px solid #10b981",
                        }}
                    >
                        <CheckCircleIcon sx={{ color: "#10b981", mr: 1.5, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: "#cbd5e1", lineHeight: 1.7 }}>
                            XGBoost was selected as the final model — it delivered the best balance of Accuracy (87%) and AUC (0.873) across all tested models. Recall remains an area for improvement, reflecting the inherent challenge of identifying churners in imbalanced datasets.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* XGBoost Summary */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, letterSpacing: 0.4, mb: 1, display: "block" }}>
                    XGBoost — Selected Model
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: { xs: "wrap", md: "nowrap" } }}>
                    <Card
                        sx={{
                            flex: 1,
                            minWidth: { xs: "100%", md: 0 },
                            background: "#1e293b",
                            borderRadius: 2,
                            border: "1px solid #334155",
                            overflow: "hidden",
                        }}
                    >
                        <Box sx={{ height: 4, background: "#6366f1" }} />
                        <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                Accuracy
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color: "#6366f1" }}>
                                {selectedModel ? `${(selectedModel.accuracy * 100).toFixed(0)}%` : "87%"}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        sx={{
                            flex: 1,
                            minWidth: { xs: "100%", md: 0 },
                            background: "#1e293b",
                            borderRadius: 2,
                            border: "1px solid #334155",
                            overflow: "hidden",
                        }}
                    >
                        <Box sx={{ height: 4, background: "#f59e0b" }} />
                        <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                Recall
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color: "#f59e0b" }}>
                                {selectedModel ? `${(selectedModel.recall * 100).toFixed(1)}%` : "51.3%"}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        sx={{
                            flex: 1,
                            minWidth: { xs: "100%", md: 0 },
                            background: "#1e293b",
                            borderRadius: 2,
                            border: "1px solid #334155",
                            overflow: "hidden",
                        }}
                    >
                        <Box sx={{ height: 4, background: "#10b981" }} />
                        <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                AUC
                            </Typography>
                            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color: "#10b981" }}>
                                {selectedModel ? selectedModel.auc.toFixed(3) : "0.873"}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Model Comparison Section */}
            <Card sx={{ background: "#1e293b", borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                        Model Comparison
                    </Typography>

                    {/* Comparison Table */}
                    <TableContainer
                        sx={{
                            border: "1px solid #334155",
                            borderRadius: 2,
                            overflow: "hidden",
                        }}
                    >
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ background: "rgba(15, 23, 42, 0.6)" }}>
                                    <TableCell sx={{ color: "#94a3b8", borderColor: "#334155", fontWeight: "bold" }}>
                                        Model
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: "#94a3b8", borderColor: "#334155", fontWeight: "bold" }}>
                                        Accuracy
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: "#94a3b8", borderColor: "#334155", fontWeight: "bold" }}>
                                        Recall
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: "#94a3b8", borderColor: "#334155", fontWeight: "bold" }}>
                                        AUC
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {model_comparison.map((row) => (
                                    (() => {
                                        const isSelected = row.model === selectedModelName;
                                        return (
                                            <TableRow
                                                key={row.model}
                                                sx={{
                                                    background: isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent",
                                                    "&:hover": { background: "rgba(99, 102, 241, 0.05)" },
                                                }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        color: "white",
                                                        borderColor: "#334155",
                                                        fontWeight: isSelected ? "bold" : "normal",
                                                        borderLeft: isSelected ? "4px solid #6366f1" : "4px solid transparent",
                                                        pl: isSelected ? 1.5 : 2,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <span>{row.model}</span>
                                                        {isSelected && (
                                                            <Chip
                                                                label="Selected"
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    background: "rgba(99, 102, 241, 0.2)",
                                                                    color: "#a5b4fc",
                                                                    fontWeight: "bold",
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center" sx={{ color: "white", borderColor: "#334155" }}>
                                                    {(row.accuracy * 100).toFixed(1)}%
                                                </TableCell>
                                                <TableCell align="center" sx={{ color: "#10b981", borderColor: "#334155", fontWeight: "bold" }}>
                                                    {(row.recall * 100).toFixed(1)}%
                                                </TableCell>
                                                <TableCell align="center" sx={{ color: "#f59e0b", borderColor: "#334155", fontWeight: "bold" }}>
                                                    {row.auc.toFixed(3)}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })()
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* XGBoost Evaluation Section */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Final Model Evaluation (XGBoost)
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                    gap: 3,
                    alignItems: "stretch",
                }}
            >
                {/* Confusion Matrix */}
                <Card sx={{ background: "#1e293b", borderRadius: 2, border: "1px solid #334155", height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardContent sx={{ p: 4, flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>
                            Confusion Matrix
                        </Typography>

                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                {/* Labels */}
                                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                                    <Typography variant="caption" sx={{ color: "#94a3b8", ml: 8 }}>
                                        Predicted
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                                    <Box sx={{ width: 60 }} />
                                    <Box sx={{ width: 100, textAlign: "center" }}>
                                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                            Stay
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: 100, textAlign: "center" }}>
                                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                                            Churn
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Matrix Grid */}
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Box sx={{ width: 60, textAlign: "right", pr: 1 }}>
                                        <Typography variant="caption" sx={{ color: "#94a3b8", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                                            Actual
                                        </Typography>
                                    </Box>
                                    <Box>
                                        {/* Row 1: Actual Stay */}
                                        <Box sx={{ display: "flex", mb: 0.5 }}>
                                            <Box sx={{ width: 40, display: "flex", alignItems: "center", justifyContent: "flex-end", pr: 1 }}>
                                                <Typography variant="caption" sx={{ color: "#94a3b8" }}>Stay</Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    width: 100,
                                                    height: 80,
                                                    background: "#10b981",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "4px 0 0 0",
                                                    mr: 0.5,
                                                }}
                                            >
                                                <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }}>
                                                    {true_negative}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                                                    TN ({((true_negative / total) * 100).toFixed(1)}%)
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    width: 100,
                                                    height: 80,
                                                    background: "#f59e0b",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "0 4px 0 0",
                                                }}
                                            >
                                                <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }}>
                                                    {false_positive}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                                                    FP ({((false_positive / total) * 100).toFixed(1)}%)
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {/* Row 2: Actual Churn */}
                                        <Box sx={{ display: "flex" }}>
                                            <Box sx={{ width: 40, display: "flex", alignItems: "center", justifyContent: "flex-end", pr: 1 }}>
                                                <Typography variant="caption" sx={{ color: "#94a3b8" }}>Churn</Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    width: 100,
                                                    height: 80,
                                                    background: "#ef4444",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "0 0 0 4px",
                                                    mr: 0.5,
                                                    border: "3px solid #fbbf24",
                                                }}
                                            >
                                                <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }}>
                                                    {false_negative}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                                                    FN ({((false_negative / total) * 100).toFixed(1)}%)
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    width: 100,
                                                    height: 80,
                                                    background: "#10b981",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "0 0 4px 0",
                                                }}
                                            >
                                                <Typography variant="h5" fontWeight="bold" sx={{ color: "white" }}>
                                                    {true_positive}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                                                    TP ({((true_positive / total) * 100).toFixed(1)}%)
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* False Negative Warning */}
                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 1.5,
                                        background: "rgba(239, 68, 68, 0.08)",
                                        border: "1px solid rgba(239, 68, 68, 0.25)",
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: "#f87171" }}>
                                        ⚠️ <strong>{false_negative} churners missed</strong> (False Negatives) — these customers left but were predicted to stay.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* ROC Curve */}
                <Card sx={{ background: "#1e293b", borderRadius: 2, border: "1px solid #334155", height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardContent sx={{ p: 4, flex: 1, display: "flex", flexDirection: "column" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                ROC Curve
                            </Typography>
                            <Chip
                                label={`AUC = ${roc_curve.auc.toFixed(3)}`}
                                size="small"
                                sx={{
                                    background: "rgba(245, 158, 11, 0.2)",
                                    color: "#f59e0b",
                                    fontWeight: "bold",
                                }}
                            />
                        </Box>

                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                                    <XAxis
                                        dataKey="fpr"
                                        type="number"
                                        domain={[0, 1]}
                                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                                        axisLine={{ stroke: "#334155" }}
                                        tickLine={{ stroke: "#334155" }}
                                        label={{
                                            value: "False Positive Rate",
                                            position: "bottom",
                                            fill: "#94a3b8",
                                            fontSize: 12,
                                            offset: 10,
                                        }}
                                    />
                                    <YAxis
                                        dataKey="tpr"
                                        type="number"
                                        domain={[0, 1]}
                                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                                        axisLine={{ stroke: "#334155" }}
                                        tickLine={{ stroke: "#334155" }}
                                        label={{
                                            value: "True Positive Rate",
                                            angle: -90,
                                            position: "insideLeft",
                                            fill: "#94a3b8",
                                            fontSize: 12,
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid #334155",
                                            borderRadius: 8,
                                        }}
                                        labelStyle={{ color: "#e2e8f0", fontWeight: 700 }}
                                        itemStyle={{ color: "#94a3b8" }}
                                        formatter={(value) =>
                                            typeof value === "number" ? value.toFixed(3) : value
                                        }
                                        cursor={{ stroke: "#6366f1", strokeDasharray: "5 5" }}
                                    />
                                    {/* Diagonal reference line */}
                                    <Line
                                        data={diagonalData}
                                        type="linear"
                                        dataKey="tpr"
                                        stroke="#64748b"
                                        strokeDasharray="5 5"
                                        dot={false}
                                        name="Random Classifier"
                                    />
                                    {/* ROC Curve */}
                                    <Line
                                        data={rocData}
                                        type="monotone"
                                        dataKey="tpr"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={false}
                                        name="XGBoost"
                                        fill="url(#rocGradient)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>

                        <Box
                            sx={{
                                mt: 2,
                                p: 1.5,
                                background: "rgba(99, 102, 241, 0.1)",
                                border: "1px solid rgba(99, 102, 241, 0.3)",
                                borderRadius: 1,
                            }}
                        >
                            <Typography variant="caption" sx={{ color: "#a5b4fc" }}>
                                AUC of <strong>0.873</strong> indicates strong class separation — XGBoost reliably distinguishes churners from non-churners across all classification thresholds.
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
