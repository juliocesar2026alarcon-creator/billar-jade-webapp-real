import express from "express";
import cors from "cors";

const app = express();

// ✅ HABILITAR CORS
app.use(cors({
  origin: "https://billar-jade-frontend.onrender.com"
}));

app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend Billar Jade funcionando 🚀"
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
