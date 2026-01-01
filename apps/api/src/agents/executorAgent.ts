import { executeTool } from "./toolExecutor";
import { AVAILABLE_TOOLS } from "./tools";
import { PlanStep } from "./plannerAgent";

export interface ExecutionResult {
  step: number;
  output: any;
}

export async function executePlan(
  plan: PlanStep[]
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = [];

  for (const step of plan) {
    if (step.tool) {
      const output = await executeTool(
        AVAILABLE_TOOLS,
        step.tool,
        step.input
      );

      results.push({
        step: step.step,
        output
      });
    }
  }

  return results;
}
