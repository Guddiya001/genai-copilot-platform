import { Router, Request, Response } from "express";
import { answerWithRag } from "../rag/ragService";

const router = Router();

/**
 * POST /api/rag/answer
 * Body: { question: string }
 */
router.post("/rag/answer", async (req, res) => {
  try {

    const traceId = req.traceId;   // ✅ MUST read from middleware

    const result = await answerWithRag(
      req.body.question,
      traceId                    // ✅ MUST pass here
    );

    res.json(result);

  } catch (err: any) {
    res.status(500).json({
      error: err.message
    });
  }
});

export default router;
