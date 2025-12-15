import { Box, Typography, Tabs, Tab } from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SettingsIcon from "@mui/icons-material/Settings";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";

export default function Navbar({ tab, setTab }) {
    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    return (
        <Box sx={{ mb: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, py: 2, px: 2, backgroundColor: "#1e293b", borderRadius: 1 }}>
                <Box
                    sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                    }}
                >
                    <PsychologyIcon sx={{ fontSize: 30, color: "white" }} />
                </Box>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Bank Churn Prediction
                    </Typography>
                    <Typography variant="body2" color="gray">
                        AI-Powered Customer Retention Platform
                    </Typography>
                </Box>
            </Box>

            {/* Navigation Tabs */}
            <Tabs
                value={tab}
                onChange={handleTabChange}
                sx={{
                    "& .MuiTabs-indicator": {
                        display: "none",
                    },
                    "& .MuiTab-root": {
                        textTransform: "none",
                        color: "gray",
                        minHeight: 40,
                        borderRadius: 2,
                        mr: 1,
                        "&.Mui-selected": {
                            color: "white",
                            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        },
                    },
                }}
            >
                <Tab
                    icon={<SettingsIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label="Predict Churn"
                />
                <Tab
                    icon={<ShowChartIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label="Analytics"
                />
                <Tab
                    icon={<AutoGraphIcon sx={{ fontSize: 18 }} />}
                    iconPosition="start"
                    label="Model Performance"
                />
            </Tabs>
        </Box>
    );
}
