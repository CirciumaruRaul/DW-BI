import { Typography, Grid, Paper } from "@mui/material";
import DashboardCards from "../components/DashboardCards";

export default function Dashboard() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      <DashboardCards />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 300 }}>
            {/* Chart Placeholder */}
            Revenue / Activity Chart
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 300 }}>
            Recent Activity
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}