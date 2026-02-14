import { useState } from "react";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from "@mui/material";

import { dim_ships } from "../mock/dummyData";

export default function Ships() {
  const [ships, setShips] = useState(dim_ships);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    company_id: "",
    imo_number: "",
    ship_name: "",
    build_year: "",
    teu_capacity: "",
    gross_tonnage: "",
    fuel_type: ""
  });

  const handleAddShip = () => {
    const now = new Date().toISOString();

    const newShip = {
      id: Date.now(),
      company_id: Number(form.company_id),
      imo_number: form.imo_number,
      ship_name: form.ship_name,
      build_year: Number(form.build_year),
      teu_capacity: Number(form.teu_capacity),
      gross_tonnage: Number(form.gross_tonnage),
      fuel_type: form.fuel_type,
      created_at: now,
      updated_at: now
    };

    setShips(prev => [...prev, newShip]);
    setOpen(false);

    setForm({
      company_id: "",
      imo_number: "",
      ship_name: "",
      build_year: "",
      teu_capacity: "",
      gross_tonnage: "",
      fuel_type: ""
    });
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Ships
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Add Ship
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>IMO</TableCell>
              <TableCell>Company ID</TableCell>
              <TableCell>Build Year</TableCell>
              <TableCell>TEU</TableCell>
              <TableCell>Gross Tonnage</TableCell>
              <TableCell>Fuel</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ships.map(ship => (
              <TableRow key={ship.id}>
                <TableCell>{ship.ship_name}</TableCell>
                <TableCell>{ship.imo_number}</TableCell>
                <TableCell>{ship.company_id}</TableCell>
                <TableCell>{ship.build_year}</TableCell>
                <TableCell>{ship.teu_capacity}</TableCell>
                <TableCell>{ship.gross_tonnage}</TableCell>
                <TableCell>{ship.fuel_type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Ship</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Company ID"
            type="number"
            value={form.company_id}
            onChange={e => setForm({ ...form, company_id: e.target.value })}
          />

          <TextField
            label="Ship Name"
            value={form.ship_name}
            onChange={e => setForm({ ...form, ship_name: e.target.value })}
          />

          <TextField
            label="IMO Number"
            value={form.imo_number}
            onChange={e => setForm({ ...form, imo_number: e.target.value })}
          />

          <TextField
            label="Build Year"
            type="number"
            value={form.build_year}
            onChange={e => setForm({ ...form, build_year: e.target.value })}
          />

          <TextField
            label="TEU Capacity"
            type="number"
            value={form.teu_capacity}
            onChange={e => setForm({ ...form, teu_capacity: e.target.value })}
          />

          <TextField
            label="Gross Tonnage"
            type="number"
            value={form.gross_tonnage}
            onChange={e => setForm({ ...form, gross_tonnage: e.target.value })}
          />

          <TextField
            label="Fuel Type"
            value={form.fuel_type}
            onChange={e => setForm({ ...form, fuel_type: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddShip}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
