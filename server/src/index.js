import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/*
  ============================
  CONFIGURACIÓN GENERAL
  ============================
*/
const TARIFA_POR_HORA = 15;
const MIN_MINUTOS = 30;
const FRACCION_MINUTOS = 5;

/*
  ============================
  ESTADO EN MEMORIA
  (fuente de verdad del sistema)
  ============================
*/
let mesas = Array.from({ length: 10 }, (_, i) => ({
  id: `mesa_${i + 1}`,
  name: `Mesa ${i + 1}`,
  status: "libre",       // "libre" | "ocupada"
  session: null          // sesión activa o null
}));

const nowTs = () => Date.now();

/*
  ============================
  CÁLCULOS DE TIEMPO / COBRO
  ============================
*/
function computeCharge({ start, end, pausedMs = 0 }) {
  const effectiveMs = Math.max(0, end - start - pausedMs);
  const minutes = Math.max(0, Math.ceil(effectiveMs / 60000));

  const roundedMinutes =
    minutes <= MIN_MINUTOS
      ? MIN_MINUTOS
      : Math.ceil(minutes / FRACCION_MINUTOS) * FRACCION_MINUTOS;

  const amount = (roundedMinutes / 60) * TARIFA_POR_HORA;

  return {
    minutes,
    rounded: roundedMinutes,
    amount: Number(amount.toFixed(2))
  };
}

/*
  ============================
  API
  ============================
*/

// Obtener todas las mesas
app.get("/mesas", (req, res) => {
  res.json(mesas);
});

// Iniciar mesa
app.post("/mesas/:id/iniciar", (req, res) => {
  const mesa = mesas.find(m => m.id === req.params.id);
  if (!mesa) return res.sendStatus(404);

  if (mesa.status === "libre") {
    mesa.status = "ocupada";
    mesa.session = {
      id: `ses_${Math.random().toString(36).slice(2, 9)}`,
      start: nowTs(),
      customerName: "",
      items: [],
      pausedMs: 0,
      isPaused: false,
      pausedAt: null
    };
  }

  res.json(mesa);
});

// Pausar / Reanudar mesa
app.post("/mesas/:id/pausar", (req, res) => {
  const mesa = mesas.find(m => m.id === req.params.id);
  if (!mesa || !mesa.session) return res.sendStatus(404);

  const s = mesa.session;

  if (!s.isPaused) {
    s.isPaused = true;
    s.pausedAt = nowTs();
  } else {
    s.isPaused = false;
    s.pausedMs += nowTs() - (s.pausedAt || nowTs());
    s.pausedAt = null;
  }

  res.json(mesa);
});

// Agregar producto a la mesa
app.post("/mesas/:id/producto", (req, res) => {
  const mesa = mesas.find(m => m.id === req.params.id);
  if (!mesa || !mesa.session) return res.sendStatus(404);

  const { nombre, precio } = req.body;
  if (!nombre || !precio) return res.sendStatus(400);

  mesa.session.items.push({
    id: `it_${Math.random().toString(36).slice(2, 9)}`,
    name: nombre,
    price: Number(precio),
    qty: 1
  });

  res.json(mesa);
});

// Cerrar mesa
app.post("/mesas/:id/cerrar", (req, res) => {
  const mesa = mesas.find(m => m.id === req.params.id);
  if (!mesa || !mesa.session) return res.sendStatus(404);

  const end = nowTs();
  const charge = computeCharge({
    start: mesa.session.start,
    end,
    pausedMs: mesa.session.pausedMs
  });

  const productos = mesa.session.items.reduce(
    (s, it) => s + it.price * it.qty,
    0
  );

  const cierre = {
    mesa: mesa.name,
    inicio: mesa.session.start,
    fin: end,
    tiempo: charge,
    productos,
    total: Number((productos + charge.amount).toFixed(2))
  };

  mesa.status = "libre";
  mesa.session = null;

  res.json(cierre);
});

// + Mesa
app.post("/mesas", (req, res) => {
  const id = `mesa_${mesas.length + 1}`;
  mesas.push({
    id,
    name: `Mesa ${mesas.length + 1}`,
    status: "libre",
    session: null
  });
  res.json(mesas);
});

// - Mesa (solo si la última está libre)
app.delete("/mesas", (req, res) => {
  const last = mesas[mesas.length - 1];
  if (!last || last.status !== "libre") {
    return res.status(400).json({ error: "Solo se puede eliminar una mesa libre" });
  }
  mesas.pop();
  res.json(mesas);
});

/*
  ============================
  START SERVER
  ============================
*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Billar backend activo en puerto", PORT);
});
