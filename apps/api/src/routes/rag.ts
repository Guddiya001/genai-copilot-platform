import { Router, Request, Response } from "express";
import { answerWithRag } from "../rag/ragService";

const router = Router();

/**
 * POST /api/rag/answer
 * Body: { question: string }
 */
router.post("/rag/answer", async (req: Request, res: Response) => {
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({
      error: "question is required"
    });
  }

  const result = await answerWithRag(question);

  return res.json(result);
});

export default router;
