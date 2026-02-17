import { Router } from "express";
import { getAllTraces } from "../observability/traceStore";

const router = Router();

router.get("/traces", (_req, res) => {
  res.json({
    traces: getAllTraces()
  });
});

export default router;
