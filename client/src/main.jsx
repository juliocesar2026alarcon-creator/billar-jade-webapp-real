import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const API = import.meta.env.VITE_API_URL;

// Formatea segundos a mm:ss
const fmt = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
};

function App() {
  const [mesas, setMesas] = useState([]);

  const cargarMesas = () => {
    fetch(`${API}/mesas`)
      .then(res => res.json())
      .then(data => setMesas(data));
  };

  useEffect(() => {
    cargarMesas();
    const t = setInterval(cargarMesas, 1000); // refresco cada 1s
    return () => clearInterval(t);
  }, []);

  const accionMesa = (id, accion) => {
    fetch(`${API}/mesas/${id}/${accion}`, { method: "POST" })
      .then(() => cargarMesas());
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🎱 Billar Jade — Mesas</h1>

      {mesas.map(mesa => (
        <div key={mesa.id}
          style={{
            border: "1px solid #ccc",
            marginBottom: "10px",
            padding: "10px"
          }}
        >
          <strong>{mesa.nombre}</strong>{" "}
          — Estado: <b>{mesa.estado}</b>
          <div>⏱ Tiempo: <b>{fmt(mesa.tiempo)}</b></div>
          <div style={{ marginTop: "5px" }}>
            <button onClick={() => accionMesa(mesa.id, "iniciar")}>Iniciar</button>{" "}
            <button onClick={() => accionMesa(mesa.id, "pausar")}>Pausar</button>{" "}
            <button onClick={() => accionMesa(mesa.id, "cerrar")}>Cerrar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
