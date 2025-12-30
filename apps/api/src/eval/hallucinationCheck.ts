import { overlapScore } from "./overlapScore";

export function checkHallucination(
  answer: string,
  context: string
) {
  const score = overlapScore(answer, context);

  return {
    score,
    hallucinated: score < 0.2
  };
}
