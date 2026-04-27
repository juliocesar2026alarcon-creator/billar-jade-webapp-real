import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// MODELO EN MEMORIA (TEMPORAL)
// ===============================
let mesas = [
  { id: 1, nombre: "Mesa 1", estado: "LIBRE", inicio: null, acumulado: 0 },
  { id: 2, nombre: "Mesa 2", estado: "LIBRE", inicio: null, acumulado: 0 },
  { id: 3, nombre: "Mesa 3", estado: "LIBRE", inicio: null, acumulado: 0 }
];

// ===============================
// UTILIDAD: tiempo actual en segundos
// ===============================
const ahora = () => Math.floor(Date.now() / 1000);

// ===============================
// ENDPOINTS
// ===============================

// Listar mesas (con tiempo calculado)
app.get("/mesas", (req, res) => {
  const data = mesas.map(m => {
    let tiempo = m.acumulado;
    if (m.estado === "EN_USO" && m.inicio) {
      tiempo += ahora() - m.inicio;
    }
    return { ...m, tiempo };
  });
  res.json(data);
});

// Iniciar mesa
app.post("/mesas/:id/iniciar", (req, res) => {
  const mesa = mesas.find(m => m.id === parseInt(req.params.id));
  if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });

  if (mesa.estado === "LIBRE" || mesa.estado === "PAUSADA") {
    mesa.estado = "EN_USO";
    mesa.inicio = ahora();
  }
  res.json(mesa);
});

// Pausar mesa
app.post("/mesas/:id/pausar", (req, res) => {
  const mesa = mesas.find(m => m.id === parseInt(req.params.id));
  if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });

  if (mesa.estado === "EN_USO" && mesa.inicio) {
    mesa.acumulado += ahora() - mesa.inicio;
    mesa.inicio = null;
    mesa.estado = "PAUSADA";
  }
  res.json(mesa);
});

// Cerrar mesa
app.post("/mesas/:id/cerrar", (req, res) => {
  const mesa = mesas.find(m => m.id === parseInt(req.params.id));
  if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });

  mesa.estado = "LIBRE";
  mesa.inicio = null;
  mesa.acumulado = 0;
  res.json(mesa);
});

// ===============================
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
