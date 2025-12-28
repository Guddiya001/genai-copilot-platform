import { Router, Request, Response } from "express";
import { loadTextDocument } from "../ingestion/documentLoader";
import { cleanText } from "../ingestion/textCleaner";
import { chunkText } from "../ingestion/chunker";
import { createEmbeddingByGemini } from "../embeddings/embeddingClient";
import { vectorStore } from "../vectorstore/inMemoryVectorStore";

const router = Router();

/**
 * POST /api/ingest
 * Body: { text: string, metadata?: object }
 */
router.post("/ingest", async (req: Request, res: Response) => {
  const { text, metadata } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "text is required" });
  }

  // 1. Load document
  const document = loadTextDocument(text, metadata);

  // 2. Clean text
  const cleaned = cleanText(document.content);

  // 3. Chunk text
  const chunks = chunkText(cleaned);

  // 4. Embed + store chunks
  for (const chunk of chunks) {
    const embedding = await createEmbeddingByGemini(chunk.text);

    vectorStore.upsert({
      id: chunk.id,
      embedding,
      metadata: {
        documentId: document.id,
        chunkIndex: chunk.index,
        text: chunk.text,
        ...document.metadata
      }
    });
  }

  return res.json({
    success: true,
    documentId: document.id,
    chunksIndexed: chunks.length
  });
});

export default router;
