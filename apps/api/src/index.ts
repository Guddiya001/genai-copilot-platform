import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import chatRouter from "./routes/chat";
import chatStreamRouter from "./routes/chatStream";

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/", healthRouter);
app.use("/api", chatRouter);
app.use("/api", chatStreamRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path
  });
});

app.listen(PORT, () => {
  console.log(`✅ GenAI API running on http://localhost:${PORT}`);
});
