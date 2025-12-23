import { Router, Request, Response } from "express";
import { chatRequestSchema } from "../types/chat";
import { buildChatMessages } from "../services/promptEngine";
import { streamChatWithLLM } from "../services/llmClient";

const router = Router();

/**
 * POST /api/chat/stream
 * Streams tokens using Server-Sent Events (SSE)
 */
router.post("/chat/stream", async (req: Request, res: Response) => {
  const parsed = chatRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request body",
      details: parsed.error.flatten()
    });
  }

  // --- SSE Headers ---
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const messages = buildChatMessages(parsed.data.messages, {
    promptKey: "chat:v1"
  });

  try {
    await streamChatWithLLM(messages, (token) => {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    });

    // Signal completion
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("[STREAM ERROR]", err);

    res.write(
      `data: ${JSON.stringify({
        error: "Streaming failed"
      })}\n\n`
    );
    res.end();
  }
});

export default router;
