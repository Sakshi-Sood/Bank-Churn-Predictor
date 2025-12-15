import { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress
} from "@mui/material";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import ShowChartIcon from "@mui/icons-material/ShowChart";

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/analytics")
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load analytics:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                <CircularProgress sx={{ color: "#6366f1" }} />
            </Box>
        );
    }

    if (!data) {
        return (
            <Typography color="error">Failed to load analytics. Is the API running?</Typography>
        );
    }

    const geoData = Object.entries(data.churn_by_geography)
        .map(([key, value]) => ({ name: key, churn: (value * 100).toFixed(1) }));

    const genderData = Object.entries(data.churn_by_gender)
        .map(([key, value]) => ({ name: key, churn: (value * 100).toFixed(1) }));

    const activityData = data.churn_by_activity
        ? Object.entries(data.churn_by_activity)
            .map(([key, value]) => ({ name: key, churn: (value * 100).toFixed(1) }))
        : [];

    const geoColors = ["#6366f1", "#8b5cf6", "#a855f7"];
    const genderColors = ["#22c55e", "#3b82f6"];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{
                    backgroundColor: "#1e293b",
                    p: 1.5,
                    borderRadius: 1,
                    border: "1px solid #334155",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)"
                }}>
                    <Typography variant="body2" color="white" fontWeight="bold">{label}</Typography>
                    <Typography variant="body2" sx={{ color: "#6366f1" }}>
                        Churn Rate: {payload[0].value}%
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    // Custom cursor style to remove white background on hover
    const CustomCursor = ({ x, y, width, height }) => {
        return (
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="rgba(99, 102, 241, 0.1)"
                stroke="none"
            />
        );
    };

    return (
        <Box>
            {/* Header */}
            <Card sx={{ background: "#1e293b", borderRadius: 2, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <ShowChartIcon sx={{ fontSize: 24, mr: 1, color: "white" }} />
                        <Typography variant="h6" fontWeight="bold">
                            Analytics Overview
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        backgroundColor: "#334155",
                        borderRadius: 2
                    }}>
                        <Box>
                            <Typography variant="body2" color="gray">
                                Overall Churn Rate
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" sx={{ color: "#ef4444" }}>
                                {(data.overall_churn_rate * 100).toFixed(2)}%
                            </Typography>
                        </Box>
                        <Box sx={{ ml: "auto", textAlign: "right" }}>
                            <Typography variant="body2" color="gray">
                                Total Customers Analyzed
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="white">
                                {data.age_distribution.churn.length + data.age_distribution.not_churn.length}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Charts Row */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {/* Churn by Geography */}
                <Card sx={{ background: "#1e293b", borderRadius: 2, flex: 1, minWidth: 300 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            Churn by Geography
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={geoData}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#9ca3af" }}
                                    axisLine={{ stroke: "#334155" }}
                                />
                                <YAxis
                                    tick={{ fill: "#9ca3af" }}
                                    axisLine={{ stroke: "#334155" }}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                                <Bar dataKey="churn" radius={[4, 4, 0, 0]}>
                                    {geoData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={geoColors[index % geoColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Churn by Gender */}
                <Card sx={{ background: "#1e293b", borderRadius: 2, flex: 1, minWidth: 300 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="bold" mb={2}>
                            Churn by Gender
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={genderData}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#9ca3af" }}
                                    axisLine={{ stroke: "#334155" }}
                                />
                                <YAxis
                                    tick={{ fill: "#9ca3af" }}
                                    axisLine={{ stroke: "#334155" }}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                                <Bar dataKey="churn" radius={[4, 4, 0, 0]}>
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={genderColors[index % genderColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Box>

            {/* Activity vs Churn Chart */}
            <Card sx={{ background: "#1e293b", borderRadius: 2, mt: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Activity Status vs Churn
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <ResponsiveContainer width="60%" height={250}>
                            <BarChart data={activityData} layout="vertical">
                                <XAxis
                                    type="number"
                                    tick={{ fill: "#9ca3af" }}
                                    axisLine={{ stroke: "#334155" }}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fill: "#9ca3af" }}
                                    axisLine={{ stroke: "#334155" }}
                                    width={80}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                                <Bar dataKey="churn" radius={[0, 4, 4, 0]}>
                                    {activityData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.name === "Active" ? "#22c55e" : "#ef4444"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ p: 2, backgroundColor: "#334155", borderRadius: 2, mb: 2 }}>
                                <Typography variant="body2" color="gray">
                                    Active Members Churn Rate
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" sx={{ color: "#22c55e" }}>
                                    {activityData.find(d => d.name === "Active")?.churn}%
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, backgroundColor: "#334155", borderRadius: 2 }}>
                                <Typography variant="body2" color="gray">
                                    Inactive Members Churn Rate
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" sx={{ color: "#ef4444" }}>
                                    {activityData.find(d => d.name === "Inactive")?.churn}%
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Key Insights */}
            <Card sx={{ background: "#1e293b", borderRadius: 2, mt: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Key Insights
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Box sx={{ flex: 1, minWidth: 200, p: 2, backgroundColor: "#334155", borderRadius: 2 }}>
                            <Typography variant="body2" color="gray" mb={0.5}>
                                Highest Churn Geography
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: "#ef4444" }}>
                                {geoData.reduce((max, item) => parseFloat(item.churn) > parseFloat(max.churn) ? item : max, geoData[0]).name}
                            </Typography>
                            <Typography variant="body2" color="gray">
                                {geoData.reduce((max, item) => parseFloat(item.churn) > parseFloat(max.churn) ? item : max, geoData[0]).churn}% churn rate
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 200, p: 2, backgroundColor: "#334155", borderRadius: 2 }}>
                            <Typography variant="body2" color="gray" mb={0.5}>
                                Highest Churn Gender
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: "#f59e0b" }}>
                                {genderData.reduce((max, item) => parseFloat(item.churn) > parseFloat(max.churn) ? item : max, genderData[0]).name}
                            </Typography>
                            <Typography variant="body2" color="gray">
                                {genderData.reduce((max, item) => parseFloat(item.churn) > parseFloat(max.churn) ? item : max, genderData[0]).churn}% churn rate
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 200, p: 2, backgroundColor: "#334155", borderRadius: 2 }}>
                            <Typography variant="body2" color="gray" mb={0.5}>
                                Churned Customers
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: "#22c55e" }}>
                                {data.age_distribution.churn.length}
                            </Typography>
                            <Typography variant="body2" color="gray">
                                out of {data.age_distribution.churn.length + data.age_distribution.not_churn.length} total
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
