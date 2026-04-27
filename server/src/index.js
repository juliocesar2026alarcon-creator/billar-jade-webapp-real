import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// CONFIGURACIÓN DE FACTURACIÓN
// ===============================
const TARIFA_POR_HORA = 15;        // Bs
const MINIMO_MINUTOS = 30;         // 30 min
const FRACCION_MINUTOS = 5;        // 5 min

let mesas = [
  { id: 1, nombre: "Mesa 1", estado: "LIBRE", inicio: null, acumulado: 0 },
  { id: 2, nombre: "Mesa 2", estado: "LIBRE", inicio: null, acumulado: 0 },
  { id: 3, nombre: "Mesa 3", estado: "LIBRE", inicio: null, acumulado: 0 }
];

const ahora = () => Math.floor(Date.now() / 1000);

// ===============================
// CÁLCULOS
// ===============================
function segundosReales(m) {
  let s = m.acumulado;
  if (m.estado === "EN_USO" && m.inicio) {
    s += ahora() - m.inicio;
  }
  return s;
}

function segundosAFacturar(seg) {
  const minutos = Math.ceil(seg / 60);

  if (minutos <= MINIMO_MINUTOS) {
    return MINIMO_MINUTOS * 60;
  }

  const resto = minutos % FRACCION_MINUTOS;
  const redondeado =
    resto === 0 ? minutos : minutos + (FRACCION_MINUTOS - resto);

  return redondeado * 60;
}

function calcularMonto(segFacturable) {
  return +((segFacturable / 3600) * TARIFA_POR_HORA).toFixed(2);
}

// ===============================
// ENDPOINTS
// ===============================
app.get("/mesas", (req, res) => {
  res.json(
    mesas.map(m => {
      const real = segundosReales(m);
      const facturable = segundosAFacturar(real);
      return {
        ...m,
        tiempoReal: real,
        tiempoFacturable: facturable,
        monto: calcularMonto(facturable)
      };
    })
  );
});

app.post("/mesas/:id/iniciar", (req, res) => {
  const m = mesas.find(x => x.id == req.params.id);
  if (!m) return res.sendStatus(404);
  if (m.estado !== "EN_USO") {
    m.estado = "EN_USO";
    m.inicio = ahora();
  }
  res.json(m);
});

app.post("/mesas/:id/pausar", (req, res) => {
  const m = mesas.find(x => x.id == req.params.id);
  if (!m) return res.sendStatus(404);
  if (m.estado === "EN_USO") {
    m.acumulado += ahora() - m.inicio;
    m.inicio = null;
    m.estado = "PAUSADA";
  }
  res.json(m);
});

app.post("/mesas/:id/cerrar", (req, res) => {
  const m = mesas.find(x => x.id == req.params.id);
  if (!m) return res.sendStatus(404);
  m.estado = "LIBRE";
  m.inicio = null;
  m.acumulado = 0;
  res.json(m);
});

// + / - Mesas (como ya tenías)
app.post("/mesas", (req, res) => {
  const id = mesas.length ? mesas[mesas.length - 1].id + 1 : 1;
  mesas.push({ id, nombre: `Mesa ${id}`, estado: "LIBRE", inicio: null, acumulado: 0 });
  res.json(mesas);
});

app.delete("/mesas", (req, res) => {
  const last = mesas[mesas.length - 1];
  if (!last || last.estado !== "LIBRE") {
    return res.status(400).json({ error: "Solo se puede eliminar una mesa LIBRE" });
  }
  mesas.pop();
  res.json(mesas);
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log("Backend listo"));
``
