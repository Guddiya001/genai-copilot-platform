import { createPlan } from "./plannerAgent";
import { executePlan } from "./executorAgent";
import { chatWithLLM } from "../services/llmClient";

export async function runMultiAgentWorkflow(
  question: string
) {
  // 1️⃣ Planning
  const plan = await createPlan(question);

  // 2️⃣ Execution
  const executionResults = await executePlan(plan);

  // 3️⃣ Final answer
  const finalPrompt = `
You are a final answer agent.

User question:
${question}

Plan:
${JSON.stringify(plan, null, 2)}

Tool results:
${JSON.stringify(executionResults, null, 2)}

Use the tool results to answer clearly.
`;

  const finalResponse = await chatWithLLM([
    { role: "system", content: finalPrompt }
  ]);

  return {
    answer: finalResponse.content,
    plan,
    executionResults
  };
}
