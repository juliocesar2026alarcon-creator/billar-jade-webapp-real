import express from "express";
import cors from "cors";

const app = express();

// ✅ CORS ABIERTO (producción simple)
app.use(cors());

app.use(express.json());

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
