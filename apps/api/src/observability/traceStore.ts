import { Trace } from "./traceTypes";

const traces = new Map<string, Trace>();

export function startTrace(trace: Trace) {
  traces.set(trace.traceId, trace);
}

export function endTrace(traceId: string, update: Partial<Trace>) {
  const trace = traces.get(traceId);
  if (!trace) return;

  Object.assign(trace, update);
  trace.endTime = Date.now();
}

export function getTrace(traceId: string): Trace | undefined {
  return traces.get(traceId);
}

export function getAllTraces(): Trace[] {
  return Array.from(traces.values());
}
