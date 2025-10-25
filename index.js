import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import outfitRoutes from "./routes/outfitRoutes.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

app.listen(process.env.PORT || 5000, () => {
  console.log(
    `🧥 Outfit Scanner API with GPT + Serper Fallback is running on port ${
      process.env.PORT || 5000
    }`
  );
});

app.get("/", (req, res) =>
  res.send(
    "<h2>🧥 Outfit Scanner API with GPT + Serper Fallback is running!</h2>"
  )
);

app.use("/api", outfitRoutes);

export default app;
