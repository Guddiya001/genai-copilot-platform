import { chatWithLLM } from "../services/llmClient";

export interface PlanStep {
  step: number;
  action: string;
  tool?: string;
  input?: any;
}

export async function createPlan(
  question: string
): Promise<PlanStep[]> {
  const plannerPrompt = `
You are a planning agent.

Your job:
- Break the user question into clear steps.
- Decide if any step requires a tool.
- Output ONLY valid JSON array.

Available tools:
- search_knowledge_base(query)
- calculator(expression)

JSON format:
[
  {
    "step": 1,
    "action": "description",
    "tool": "optional_tool_name",
    "input": { }
  }
]
`;

  const response = await chatWithLLM([
    { role: "system", content: plannerPrompt },
    { role: "user", content: question }
  ]);

  try {
    return JSON.parse(response.content);
  } catch {
    throw new Error("Planner produced invalid JSON");
  }
}
