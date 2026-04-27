import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// MODELO EN MEMORIA (TEMPORAL)
// ===============================
let mesas = [
  { id: 1, nombre: "Mesa 1", estado: "LIBRE" },
  { id: 2, nombre: "Mesa 2", estado: "LIBRE" },
  { id: 3, nombre: "Mesa 3", estado: "LIBRE" }
];

// ===============================
// ENDPOINTS
// ===============================

// Listar mesas
app.get("/mesas", (req, res) => {
  res.json(mesas);
});

// Iniciar mesa
app.post("/mesas/:id/iniciar", (req, res) => {
  const mesa = mesas.find(m => m.id === parseInt(req.params.id));
  if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });

  mesa.estado = "EN_USO";
  res.json(mesa);
});

// Pausar mesa
app.post("/mesas/:id/pausar", (req, res) => {
  const mesa = mesas.find(m => m.id === parseInt(req.params.id));
  if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });

  mesa.estado = "PAUSADA";
  res.json(mesa);
});

// Cerrar mesa
app.post("/mesas/:id/cerrar", (req, res) => {
  const mesa = mesas.find(m => m.id === parseInt(req.params.id));
  if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });

  mesa.estado = "LIBRE";
  res.json(mesa);
});

// ===============================
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
