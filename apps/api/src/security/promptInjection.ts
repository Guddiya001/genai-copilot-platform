const INJECTION_PATTERNS = [
  /ignore (all|previous) instructions/i,
  /disregard system/i,
  /you are now/i,
  /act as/i,
  /reveal (the )?system prompt/i,
  /developer mode/i
];

export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some(rx => rx.test(input));
}
