import express from "express";

const app = express();

// Middleware básico
app.use(express.json());

// Ruta base de prueba
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend Billar Jade funcionando 🚀"
  });
});

// Render asigna el puerto por variable de entorno
const PORT = process.env.PORT;

if (!PORT) {
  console.error("ERROR: PORT no definido por Render");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
