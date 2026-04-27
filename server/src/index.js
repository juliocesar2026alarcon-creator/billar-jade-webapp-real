import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN
const TARIFA = 15;
const MIN_MIN = 30;
const FRACCION = 5;

let mesas = Array.from({ length: 10 }, (_, i) => ({
  id: `mesa_${i + 1}`,
  name: `Mesa ${i + 1}`,
  status: "libre",
  session: null,
}));
``

const ahora = () => Math.floor(Date.now() / 1000);

// CÁLCULOS
const tiempoReal = (s) =>
  s.acumulado + (s.estado === "EN_USO" ? ahora() - s.inicio : 0);

const tiempoFacturable = (seg) => {
  const min = Math.ceil(seg / 60);
  if (min <= MIN_MIN) return MIN_MIN * 60;
  const r = min % FRACCION;
  return (r ? min + (FRACCION - r) : min) * 60;
};

const monto = (seg) => +((seg / 3600) * TARIFA).toFixed(2);

// API
app.get("/mesas", (_, res) => {
  res.json(
    mesas.map(m => {
      if (!m.sesion) return m;
      const real = tiempoReal(m.sesion);
      const fact = tiempoFacturable(real);
      const productos = m.sesion.productos.reduce((s,p)=>s+p.precio,0);
      const tiempoBs = monto(fact);
      return {
        ...m,
        sesion: {
          ...m.sesion,
          tiempoReal: real,
          tiempoFacturable: fact,
          importeTiempo: tiempoBs,
          subtotalProductos: productos,
          total: tiempoBs + productos
        }
      };
    })
  );
});

// INICIAR SESIÓN
app.post("/mesas/:id/iniciar", (req,res)=>{
  const m = mesas.find(x=>x.id==req.params.id);
  if (!m) return res.sendStatus(404);
  if (!m.sesion) {
    m.sesion = {
      estado: "EN_USO",
      cliente: "",
      inicio: ahora(),
      acumulado: 0,
      productos: []
    };
  }
  res.json(m);
});

// PAUSAR
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

// PRODUCTO
app.post("/mesas/:id/producto", (req,res)=>{
  const m = mesas.find(x=>x.id==req.params.id);
  if (!m?.sesion) return res.sendStatus(404);
  m.sesion.productos.push({ nombre:req.body.nombre, precio:req.body.precio });
  res.json(m);
});

// CERRAR
app.post("/mesas/:id/cerrar", (req,res)=>{
  const m = mesas.find(x=>x.id==req.params.id);
  if (!m) return res.sendStatus(404);
  m.sesion = null;
  res.json(m);
});

// + MESA
app.post("/mesas", (_,res)=>{
  const id = mesas.length + 1;
  mesas.push({ id, nombre:`Mesa ${id}`, sesion:null });
  res.json(mesas);
});

// - MESA
app.delete("/mesas", (_,res)=>{
  const last = mesas[mesas.length-1];
  if (last?.sesion) return res.status(400).json({error:"Mesa ocupada"});
  mesas.pop();
  res.json(mesas);
});

const PORT = process.env.PORT;
app.listen(PORT, ()=>console.log("Backend listo"));
