import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
const API = import.meta.env.VITE_API_URL;

const fmt = s => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

function App(){
  const [mesas,setMesas] = useState([]);

  const cargar = () => fetch(`${API}/mesas`).then(r=>r.json()).then(setMesas);
  useEffect(()=>{ cargar(); const t=setInterval(cargar,1000); return ()=>clearInterval(t)},[]);

  const post = (url,body={}) =>
    fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(cargar);

  return (
    <div style={{padding:20}}>
      <h1>🎱 Billar Jade — Sesiones</h1>

      {mesas.map(m=>(
        <div key={m.id} style={{border:"1px solid #ccc",padding:10,marginBottom:10}}>
          <b>{m.nombre}</b>

          {!m.sesion ? (
            <div>
              <p>Lista para usar</p>
              <button onClick={()=>post(`${API}/mesas/${m.id}/iniciar`)}>Iniciar</button>
            </div>
          ) : (
            <div>
              <div>
                Cliente:
                <input
                  value={m.sesion.cliente}
                  onChange={e=>m.sesion.cliente=e.target.value}
                />
              </div>

              <div>⏱ Real: {fmt(m.sesion.tiempoReal)}</div>
              <div>🧮 Facturable: {fmt(m.sesion.tiempoFacturable)}</div>
              <div>💰 Tiempo: Bs {m.sesion.importeTiempo}</div>
              <div>🧺 Productos: Bs {m.sesion.subtotalProductos}</div>
              <div>✅ TOTAL: Bs {m.sesion.total}</div>

              <button onClick={()=>post(`${API}/mesas/${m.id}/producto`,{nombre:"Bebida",precio:5})}>+ Producto</button>{" "}
              <button onClick={()=>post(`${API}/mesas/${m.id}/pausar`)}>Pausar</button>{" "}
              <button onClick={()=>post(`${API}/mesas/${m.id}/cerrar`)}>Cerrar</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
