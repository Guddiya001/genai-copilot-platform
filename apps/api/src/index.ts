import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import chatRouter from "./routes/chat";
import chatStreamRouter from "./routes/chatStream";
import embeddingRouter from "./routes/embeddings";
import ingestRouter from "./routes/ingest";
import ragRouter from "./routes/rag";
import ragEvalRouter from "./routes/ragEval";
import agentRouter from "./routes/agent";
import memoryRouter from "./routes/memory";
import { aiSecurity } from "./middleware/aiSecurity";
import { traceMiddleware } from "./observability/traceMiddleware";
import traceRouter from "./routes/trace";

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(traceMiddleware);

// Routes
app.use("/", healthRouter);
app.use("/api", chatRouter);
app.use("/api", chatStreamRouter);
app.use("/api", embeddingRouter);
app.use("/api", ingestRouter);
app.use("/api", ragRouter);
app.use("/api", ragEvalRouter);
app.use("/api", agentRouter);
app.use("/api", memoryRouter);
app.use("/api", traceRouter);

// Apply ONLY to AI endpoints
app.use("/api/rag", aiSecurity);
app.use("/api/agent", aiSecurity);


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
