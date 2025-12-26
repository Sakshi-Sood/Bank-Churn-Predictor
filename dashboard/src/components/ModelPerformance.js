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
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LineChart,
    Line,
    ReferenceLine,
    Cell,
} from "recharts";
import axios from "axios";

export default function ModelPerformance() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/model-performance")
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: 1,
                        p: 1.5,
                    }}
                >
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography
                            key={index}
                            variant="body2"
                            sx={{ color: entry.color }}
                        >
                            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(3) : entry.value}
                        </Typography>
                    ))}
                </Box>
            );
        }
        return null;
    };

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

    const { model_comparison, confusion_matrix, roc_curve, selection_reason } = data;

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
                            background: "linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))",
                            borderRadius: 1,
                            p: 2,
                            border: "1px solid #334155",
                        }}
                    >
                        <CheckCircleIcon sx={{ color: "#10b981", mr: 1.5, fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                            {selection_reason}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Model Comparison Section */}
            <Card sx={{ background: "#1e293b", borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                        Model Comparison
                    </Typography>

                    {/* Comparison Bar Chart */}
                    <Box sx={{ height: 300, mb: 4 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={model_comparison}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <XAxis
                                    dataKey="model"
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    axisLine={{ stroke: "#334155" }}
                                    tickLine={{ stroke: "#334155" }}
                                />
                                <YAxis
                                    domain={[0, 1]}
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    axisLine={{ stroke: "#334155" }}
                                    tickLine={{ stroke: "#334155" }}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                                />
                                <Legend
                                    wrapperStyle={{ paddingTop: 20 }}
                                />
                                <Bar dataKey="accuracy" name="Accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="recall" name="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="auc" name="AUC" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>

                    {/* Comparison Table */}
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
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
                                    <TableRow
                                        key={row.model}
                                        sx={{
                                            background: row.model === "XGBoost" ? "rgba(99, 102, 241, 0.1)" : "transparent",
                                            "&:hover": { background: "rgba(99, 102, 241, 0.05)" },
                                        }}
                                    >
                                        <TableCell sx={{ color: "white", borderColor: "#334155", fontWeight: row.model === "XGBoost" ? "bold" : "normal" }}>
                                            {row.model}
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

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {/* Confusion Matrix */}
                <Card sx={{ background: "#1e293b", borderRadius: 2, flex: "1 1 400px" }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>
                            Confusion Matrix
                        </Typography>

                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Box>
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
                                        background: "rgba(239, 68, 68, 0.1)",
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
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
                <Card sx={{ background: "#1e293b", borderRadius: 2, flex: "1 1 400px" }}>
                    <CardContent sx={{ p: 3 }}>
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
                                        content={<CustomTooltip />}
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
                                📈 AUC of <strong>0.873</strong> indicates excellent class separation. The model correctly ranks churners higher than non-churners 87.3% of the time.
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
