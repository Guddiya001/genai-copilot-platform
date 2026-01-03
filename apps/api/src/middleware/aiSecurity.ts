import { Request, Response, NextFunction } from "express";
import { sanitizeInput, validateInput } from "../security/inputGuard";
import { detectPromptInjection } from "../security/promptInjection";
import { checkRateLimit } from "../security/rateLimiter";

export function aiSecurity(req: Request, res: Response, next: NextFunction) {
  try {
    const ip = req.ip || "unknown";
    checkRateLimit(ip);

    if (req.body?.question) {
      const input = sanitizeInput(req.body.question);
      validateInput(input);

      if (detectPromptInjection(input)) {
        return res.status(400).json({
          error: "Prompt injection detected"
        });
      }

      req.body.question = input;
    }

    next();
  } catch (err: any) {
    return res.status(429).json({
      error: err.message
    });
  }
}
