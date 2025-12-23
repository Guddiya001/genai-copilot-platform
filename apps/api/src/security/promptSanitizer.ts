const INJECTION_PATTERNS = [
  /ignore previous instructions/i,
  /disregard system prompt/i,
  /you are now/i,
  /act as/i,
  /developer mode/i
];

export function sanitizeUserInput(input: string): string {
  let sanitized = input;

  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[FILTERED]");
  }
  console.log(`Sanitized input: ${sanitized}`);
  return sanitized.trim();
}
