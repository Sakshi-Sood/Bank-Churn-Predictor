import { useState } from "react";
import { ThemeProvider, CssBaseline, Container, Box } from "@mui/material";
import theme from "./theme";
import Navbar from "./components/Navbar";
import PredictionCard from "./components/PredictionCard";
import Analytics from "./components/Analytics";
import ModelPerformance from "./components/ModelPerformance";

function App() {
  const [tab, setTab] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", backgroundColor: "#0f172a", py: 4, px: 2 }}>
        <Container maxWidth="lg">
          <Navbar tab={tab} setTab={setTab} />
          {tab === 0 && <PredictionCard />}
          {tab === 1 && <Analytics />}
          {tab === 2 && <ModelPerformance />}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
