import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#0f172a",
            paper: "#111827",
        },
        primary: {
            main: "#6366f1",
        },
        secondary: {
            main: "#8b5cf6",
        },
    },
    shape: {
        borderRadius: 12,
    },
});

export default theme;
