import { getUsage } from "./usageStore";

const MAX_COST_PER_USER = 2.0; // $2 per user (example)

export function enforceBudget(userId: string) {
  const usage = getUsage(userId);

  if (usage.cost >= MAX_COST_PER_USER) {
    throw new Error("LLM budget exceeded");
  }
}
