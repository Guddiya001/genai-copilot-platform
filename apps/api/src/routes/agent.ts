import { Router, Request, Response } from "express";
import { runSimpleAgent } from "../agents/simpleAgent";

const router = Router();

/**
 * POST /api/agent
 * Body: { question: string }
 */
router.post("/agent", async (req: Request, res: Response) => {
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({
      error: "question is required"
    });
  }

  const result = await runSimpleAgent(question);

  res.json(result);
});

export default router;
