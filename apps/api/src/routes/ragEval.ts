import { Router, Request, Response } from "express";
import { checkHallucination } from "../eval/hallucinationCheck";

const router = Router();

/**
 * POST /api/rag/eval
 * Body: { answer: string, context: string }
 */
router.post("/rag/eval", (req: Request, res: Response) => {
  const { answer, context } = req.body;

  if (!answer || !context) {
    return res.status(400).json({
      error: "answer and context are required"
    });
  }

  const evaluation = checkHallucination(answer, context);

  res.json(evaluation);
});

export default router;
