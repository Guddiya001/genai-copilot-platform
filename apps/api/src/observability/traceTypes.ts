export interface Trace {
  traceId: string;
  userId: string;
  startTime: number;
  endTime?: number;

  model?: string;

  inputTokens?: number;
  outputTokens?: number;

  retrievalCount?: number;

  success?: boolean;
  error?: string;
}
