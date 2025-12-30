export function overlapScore(
  answer: string,
  context: string
): number {
  const answerWords = new Set(answer.toLowerCase().split(/\s+/));
  const contextWords = new Set(context.toLowerCase().split(/\s+/));

  let matches = 0;

  answerWords.forEach(word => {
    if (contextWords.has(word)) {
      matches++;
    }
  });

  return matches / Math.max(answerWords.size, 1);
}
