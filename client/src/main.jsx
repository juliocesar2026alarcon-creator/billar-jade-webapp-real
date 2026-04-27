import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const API = import.meta.env.VITE_API_URL;

const fmt = s => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2,"0")}:${r.toString().padStart(2,"0")}`;
};

function App() {
  const [mesas, setMesas] = useState([]);

  const cargar = () => {
    fetch(`${API}/mesas`).then(r => r.json()).then(setMesas);
  };

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 1000);
    return () => clearInterval(t);
  }, []);

  const accion = (id, a) =>
    fetch(`${API}/mesas/${id}/${a}`, { method: "POST" }).then(cargar);

  const addMesa = () => fetch(`${API}/mesas`, { method:"POST" }).then(cargar);
  const delMesa = () =>
    fetch(`${API}/mesas`, { method:"DELETE" })
      .then(cargar)
      .catch(() => alert("Solo se puede eliminar mesa LIBRE"));

  return (
    <div style={{ padding:20, fontFamily:"Arial" }}>
      <h1>🎱 Billar Jade — Facturación</h1>

      <div style={{ marginBottom:15 }}>
        <button onClick={addMesa}>➕ Mesa</button>{" "}
        <button onClick={delMesa}>➖ Mesa</button>
      </div>

      {mesas.map(m => (
        <div key={m.id} style={{ border:"1px solid #ccc", padding:10, marginBottom:10 }}>
          <strong>{m.nombre}</strong> — Estado: <b>{m.estado}</b>

          <div>⏱ Cronómetro: <b>{fmt(m.tiempoReal)}</b></div>
          <div>🧮 Facturable: <b>{fmt(m.tiempoFacturable)}</b></div>
          <div>💰 Importe: <b>{m.monto.toFixed(2)} Bs</b></div>

          <div style={{ marginTop:8 }}>
            <button onClick={() => accion(m.id,"iniciar")}>Iniciar</button>{" "}
            <button onClick={() => accion(m.id,"pausar")}>Pausar</button>{" "}
            <button onClick={() => accion(m.id,"cerrar")}>Cerrar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
