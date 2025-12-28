import { Router, Request, Response } from "express";
import { createEmbedding, createEmbeddingByGemini } from "../embeddings/embeddingClient";
import { vectorStore } from "../vectorstore/inMemoryVectorStore";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * POST /api/embeddings
 * Body: { text: string, metadata?: object }
 */
router.post("/embeddings", async (req: Request, res: Response) => {
  const { text, metadata } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text is required" });
  }

  const embedding = await createEmbeddingByGemini(text);

  const record = {
    id: uuidv4(),
    embedding,
    metadata
  };

  vectorStore.upsert(record);

  return res.json({
    success: true,
    vectorCount: vectorStore.size()
  });
});

/**
 * POST /api/search
 * Body: { query: string, topK?: number }
 */
router.post("/search", async (req: Request, res: Response) => {
  const { query, topK = 5 } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "query is required" });
  }

  const queryEmbedding = await createEmbeddingByGemini(query);

  const results = vectorStore.search(queryEmbedding, topK);

  return res.json({
    results
  });
});

export default router;
