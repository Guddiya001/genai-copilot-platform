import { Router, Request, Response } from "express";
import { runSimpleAgent } from "../agents/simpleAgent";
import { runMultiAgentWorkflow } from "../agents/multiAgentOrchestrator";

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


/**
 * POST /api/agent/multi
 * Body: { question: string }
 */
router.post("/agent/multi", async (req: Request, res: Response) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({
      error: "question is required"
    });
  }

  const result = await runMultiAgentWorkflow(question);

  res.json(result);
});

export default router;
