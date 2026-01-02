import { Router, Request, Response } from "express";
import { saveMemory, recallMemory } from "../memory/memoryService";

const router = Router();

/**
 * POST /api/memory/save
 */
router.post("/memory/save", async (req: Request, res: Response) => {
  const { userId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({
      error: "userId and content required"
    });
  }

  await saveMemory(userId, content);
  res.json({ success: true });
});

/**
 * POST /api/memory/recall
 */
router.post("/memory/recall", async (req: Request, res: Response) => {
  const { userId, query } = req.body;

  if (!userId || !query) {
    return res.status(400).json({
      error: "userId and query required"
    });
  }

  const memory = await recallMemory(userId, query);
  res.json({ memory });
});

export default router;
