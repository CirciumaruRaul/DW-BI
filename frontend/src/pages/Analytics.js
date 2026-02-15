import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { BarChart, LineChart, ChartsTooltip } from "@mui/x-charts";
import { fact_shipments, dim_ships } from "../mock/dummyData.js";
import { useState, useEffect } from "react";
import { executeOtlpQuery, executeDwQuery } from "../apis/api.js";

export default function Analytics() {
  const [teuPerShip, setTeuPerShip] = useState([]);
  const [cargoOverTime, setCargoOverTime] = useState([]);
  const [costPerRoute, setCostPerRoute] = useState([]);
  const [delaysPerRoute, setDelaysPerRoute] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      /* -----------------------------
         1️⃣ TEU per Ship (Operational KPI)
      -------------------------------- */
      const teuResult = await executeDwQuery(`
        SELECT s.ship_name, SUM(f.teu_utilized) AS total_teu
        FROM fact_shipments f
        JOIN dim_ships s ON f.ship_id = s.id
        GROUP BY s.ship_name
        ORDER BY total_teu DESC
      `);

      setTeuPerShip(
        teuResult.map(r => ({
          label: r.SHIP_NAME,
          value: Number(r.TOTAL_TEU)
        }))
      );

      /* -----------------------------
         2️⃣ Cargo Over Time (Monitoring)
      -------------------------------- */
      const cargoResult = await executeDwQuery(`
        SELECT TRUNC(f.departure_timestamp) AS day,
               SUM(f.cargo_tonnage) AS total_tonnage
        FROM fact_shipments f
        GROUP BY TRUNC(f.departure_timestamp)
        ORDER BY day
      `);

      setCargoOverTime(
        cargoResult.map(r => ({
          label: r.DAY,
          value: Number(r.TOTAL_TONNAGE)
        }))
      );

      /* -----------------------------
         3️⃣ Cost per Route (Cost Analysis)
      -------------------------------- */
      const costResult = await executeDwQuery(`
        SELECT r.route_name,
               SUM(f.port_fees) AS total_cost
        FROM fact_shipments f
        JOIN dim_routes r ON f.route_id = r.id
        GROUP BY r.route_name
        ORDER BY total_cost DESC
      `);

      setCostPerRoute(
        costResult.map(r => ({
          label: r.ROUTE_NAME,
          value: Number(r.TOTAL_COST)
        }))
      );

      /* -----------------------------
         4️⃣ Delays per Route (Route & Status Analysis)
      -------------------------------- */
      const delayResult = await executeDwQuery(`
        SELECT r.route_name,
               COUNT(*) AS delayed_count
        FROM fact_shipments f
        JOIN dim_routes r ON f.route_id = r.id
        WHERE f.status = 'DELAYED'
        GROUP BY r.route_name
        ORDER BY delayed_count DESC
      `);

      setDelaysPerRoute(
        delayResult.map(r => ({
          label: r.ROUTE_NAME,
          value: Number(r.DELAYED_COUNT)
        }))
      );

    } catch (err) {
      console.error("Analytics error:", err);
    }
  }


  return (
    <div style={{ padding: "2rem" }}>
      <h2>Analytics Dashboard</h2>

      {/* TEU per Ship */}
      <div style={{ height: 400, marginBottom: 60 }}>
        <h3>Total TEU per Ship</h3>
        <BarChart
          xAxis={[{ scaleType: "band", data: teuPerShip.map(d => d.label) }]}
          series={[{ data: teuPerShip.map(d => d.value), label: "TEU" }]}
          height={350}
        />
      </div>

      {/* Cargo Over Time */}
      <div style={{ height: 400, marginBottom: 60 }}>
        <h3>Cargo Tonnage Over Time</h3>
        <LineChart
          xAxis={[{ scaleType: "point", data: cargoOverTime.map(d => d.label) }]}
          series={[{ data: cargoOverTime.map(d => d.value), label: "Tonnage" }]}
          height={350}
        />
      </div>

      {/* Cost per Route */}
      <div style={{ height: 400, marginBottom: 60 }}>
        <h3>Total Port Fees per Route</h3>
        <BarChart
          xAxis={[{ scaleType: "band", data: costPerRoute.map(d => d.label) }]}
          series={[{ data: costPerRoute.map(d => d.value), label: "Port Fees" }]}
          height={350}
        />
      </div>

      {/* Delays per Route */}
      <div style={{ height: 400 }}>
        <h3>Delayed Shipments per Route</h3>
        <BarChart
          xAxis={[{ scaleType: "band", data: delaysPerRoute.map(d => d.label) }]}
          series={[{ data: delaysPerRoute.map(d => d.value), label: "Delays" }]}
          height={350}
        />
      </div>
    </div>
  );
}
