import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const API = import.meta.env.VITE_API_URL;

// Formato mm:ss
const fmt = (s = 0) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, "0")}:${r
    .toString()
    .padStart(2, "0")}`;
};

function App() {
  const [mesas, setMesas] = useState([]);

  const cargarMesas = () => {
    fetch(`${API}/mesas`)
      .then((r) => r.json())
      .then(setMesas);
  };

  useEffect(() => {
    cargarMesas();
    const t = setInterval(cargarMesas, 1000);
    return () => clearInterval(t);
  }, []);

  const post = (url, body = {}) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(cargarMesas);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>🎱 Billar Jade — Sesiones</h1>

      {/* ===== BOTONES + / - MESA ===== */}
      <div style={{ marginBottom: 15 }}>
        <button onClick={() => post(`${API}/mesas`)}>➕ Mesa</button>{" "}
        <button
          onClick={() =>
            post(`${API}/mesas`, {}, "DELETE").catch(() =>
              alert("Solo se puede eliminar una mesa LIBRE")
            )
          }
        >
          ➖ Mesa
        </button>
      </div>

      {/* ===== MESAS ===== */}
      {mesas.map((m) => (
        <div
          key={m.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <strong>{m.nombre}</strong>

          {/* ===== SIN SESIÓN ===== */}
          {!m.sesion ? (
            <div>
              <p>Lista para usar</p>
              <button onClick={() => post(`${API}/mesas/${m.id}/iniciar`)}>
                Iniciar
              </button>
            </div>
          ) : (
            /* ===== CON SESIÓN ===== */
            <div>
              <div>
                Cliente:{" "}
                <input
                  value={m.sesion.cliente}
                  onChange={(e) =>
                    (m.sesion.cliente = e.target.value)
                  }
                />
              </div>

              <div>⏱ Cronómetro: {fmt(m.sesion.tiempoReal)}</div>
              <div>🧮 Facturable: {fmt(m.sesion.tiempoFacturable)}</div>
              <div>💰 Tiempo: Bs {m.sesion.importeTiempo}</div>
              <div>
                🧺 Productos: Bs {m.sesion.subtotalProductos}
              </div>
              <div>
                ✅ <strong>TOTAL: Bs {m.sesion.total}</strong>
              </div>

              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() =>
                    post(`${API}/mesas/${m.id}/producto`, {
                      nombre: "Bebida",
                      precio: 5,
                    })
                  }
                >
                  + Producto
                </button>{" "}
                <button
                  onClick={() => post(`${API}/mesas/${m.id}/pausar`)}
                >
                  Pausar
                </button>{" "}
                <button
                  onClick={() => post(`${API}/mesas/${m.id}/cerrar`)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
