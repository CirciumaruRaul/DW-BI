import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { BarChart, LineChart, ChartsTooltip } from "@mui/x-charts";
import { fact_shipments, dim_ships } from "../mock/dummyData.js";

export default function Analytics() {
  // Prepare chart data
  const teuPerShip = dim_ships.map(ship => {
    const shipmentsOfShip = fact_shipments.filter(s => s.ship_id === ship.id);
    const totalTeu = shipmentsOfShip.reduce((sum, s) => sum + s.teu_utilized, 0);
    return { label: ship.ship_name, value: totalTeu };
  });

  const cargoOverTime = fact_shipments.map(s => ({
    label: new Date(s.departure_timestamp).toISOString().split("T")[0],
    value: s.cargo_tonnage
  }));

  const crewVsFuel = fact_shipments.map(s => ({
    label: dim_ships.find(ship => ship.id === s.ship_id)?.ship_name || "Unknown",
    crew: s.crew_count,
    fuel: s.fuel_consumed
  }));

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      <Grid container spacing={2}>
        {/* TEU per Ship */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total TEU per Ship</Typography>
              <BarChart
                series={[{ data: teuPerShip.map(d => d.value), label: "TEU" }]}
                categories={teuPerShip.map(d => d.label)}
              >
                <ChartsTooltip />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        {/* Cargo over Time */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Cargo Tonnage Over Time</Typography>
              <LineChart
                series={[{ data: cargoOverTime.map(d => d.value), label: "Cargo" }]}
                categories={cargoOverTime.map(d => d.label)}
              >
                <ChartsTooltip />
              </LineChart>
            </CardContent>
          </Card>
        </Grid>

        {/* Crew vs Fuel */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Crew Count vs Fuel Consumed</Typography>
              <BarChart
                series={[
                  { data: crewVsFuel.map(d => d.crew), label: "Crew" },
                  { data: crewVsFuel.map(d => d.fuel), label: "Fuel" }
                ]}
                categories={crewVsFuel.map(d => d.label)}
              >
                <ChartsTooltip />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
