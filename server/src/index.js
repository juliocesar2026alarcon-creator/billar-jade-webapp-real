import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// CONFIGURACIÓN
// ===============================
const TARIFA_POR_HORA = 15;
const MIN_MIN = 30;
const FRACCION = 5;

// ===============================
// MESAS + SESIÓN
// ===============================
let mesas = [
  { id: 1, nombre: "Mesa 1", sesion: null },
  { id: 2, nombre: "Mesa 2", sesion: null },
  { id: 3, nombre: "Mesa 3", sesion: null },
];

const ahora = () => Math.floor(Date.now() / 1000);

// ===============================
// UTILIDADES
// ===============================
function calcTiempoReal(s) {
  let t = s.acumulado;
  if (s.estado === "EN_USO") t += ahora() - s.inicio;
  return t;
}

function calcFacturable(seg) {
  const min = Math.ceil(seg / 60);
  if (min <= MIN_MIN) return MIN_MIN * 60;
  const r = min % FRACCION;
  return (r === 0 ? min : min + (FRACCION - r)) * 60;
}

function montoTiempo(seg) {
  return +((seg / 3600) * TARIFA_POR_HORA).toFixed(2);
}

// ===============================
// API
// ===============================
app.get("/mesas", (_, res) => {
  res.json(mesas.map(m => {
    if (!m.sesion) return m;

    const real = calcTiempoReal(m.sesion);
    const fact = calcFacturable(real);

    return {
      ...m,
      sesion: {
        ...m.sesion,
        tiempoReal: real,
        tiempoFacturable: fact,
        importeTiempo: montoTiempo(fact),
        subtotalProductos: m.sesion.productos.reduce((s,p)=>s+p.precio,0),
        total:
          montoTiempo(fact) +
          m.sesion.productos.reduce((s,p)=>s+p.precio,0)
      }
    };
  }));
});

// Iniciar sesión
app.post("/mesas/:id/iniciar", (req,res) => {
  const m = mesas.find(x=>x.id==req.params.id);
  if (!m) return res.sendStatus(404);

  m.sesion = {
    estado: "EN_USO",
    cliente: "",
    inicio: ahora(),
    acumulado: 0,
    productos: []
  };
  res.json(m);
});

// Pausar
app.post("/mesas/:id/pausar", (req,res)=>{
  const m = mesas.find(x=>x.id==req.params.id);
  if (!m?.sesion) return res.sendStatus(404);

  const s = m.sesion;
  if (s.estado === "EN_USO") {
    s.acumulado += ahora() - s.inicio;
    s.inicio = null;
    s.estado = "PAUSADA";
  }
  res.json(m);
});

// Agregar producto
app.post("/mesas/:id/producto", (req,res)=>{
  const m = mesas.find(x=>x.id==req.params.id);
  if (!m?.sesion) return res.sendStatus(404);

  m.sesion.productos.push({
    nombre: req.body.nombre,
    precio: req.body.precio
  });
  res.json(m);
});

// Cerrar sesión
app.post("/mesas/:id/cerrar", (req,res)=>{
  const m = mesas.find(x=>x.id==req.params.id);
  if (!m) return res.sendStatus(404);
  m.sesion = null;
  res.json(m);
});

const PORT = process.env.PORT;
app.listen(PORT, ()=>console.log("Backend listo"));
