const requests = new Map<string, { count: number; ts: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30;

export function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = requests.get(key);

  if (!entry || now - entry.ts > WINDOW_MS) {
    requests.set(key, { count: 1, ts: now });
    return;
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    throw new Error("Rate limit exceeded");
  }
}
