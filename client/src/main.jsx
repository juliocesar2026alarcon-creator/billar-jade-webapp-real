import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [status, setStatus] = useState("Cargando...");
  const [error, setError] = useState("");

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;

    fetch(apiUrl + "/")
      .then((res) => {
        if (!res.ok) throw new Error("Error HTTP " + res.status);
        return res.json();
      })
      .then((data) => {
        setStatus(data.message || "Respuesta recibida");
      })
      .catch((err) => {
        setError("No se pudo conectar al backend");
        console.error(err);
      });
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🎱 Billar Jade</h1>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <p>{status}</p>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
