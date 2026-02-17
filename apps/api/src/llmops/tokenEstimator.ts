export function estimateTokens(text: string): number {
  // Rough average: 4 chars ≈ 1 token
  return Math.ceil(text.length / 4);
}
