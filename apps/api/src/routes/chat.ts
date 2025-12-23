import { Router, Request, Response } from "express";
import { chatRequestSchema } from "../types/chat";
import { chatWithLLM } from "../services/llmClient";
import { buildChatMessages } from "../services/promptEngine";

const router = Router();

/**
 * POST /api/chat
 * Body: { messages: [{ role, content }, ...] }
 */
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const parseResult = chatRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parseResult.error.flatten()
      });
    }

    const { messages } = parseResult.data;

    const finalMessages = buildChatMessages(messages, {
      promptKey: "chat:v1"
    });


    const response = await chatWithLLM(finalMessages);

    return res.status(200).json({
      success: true,
      reply: response.content
    });
  } catch (error: any) {
    console.error("[ERROR] /api/chat failed:", error);

    return res.status(500).json({
      error: "Failed to process chat request",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

export default router;
