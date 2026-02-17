import crypto from "crypto";
import { startTrace, endTrace } from "./traceStore";

export function createTrace(userId: string) {
  const traceId = crypto.randomUUID();

  startTrace({
    traceId,
    userId,
    startTime: Date.now()
  });

  return traceId;
}

export function completeTrace(
  traceId: string,
  data: {
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    retrievalCount?: number;
    success: boolean;
    error?: string;
  }
) {
  endTrace(traceId, data);
}
