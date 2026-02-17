import { Request, Response, NextFunction } from "express";
import { createTrace } from "./tracer";

export function traceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = "demo-user";

  const traceId = createTrace(userId);

  req.traceId = traceId;

  res.setHeader("X-Trace-Id", traceId);

  next();
}

