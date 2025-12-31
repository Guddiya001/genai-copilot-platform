import { chatWithLLM } from "../services/llmClient";
import { AVAILABLE_TOOLS } from "./tools";
import { executeTool } from "./toolExecutor";

interface AgentResult {
    answer: string;
    toolUsed?: string;
}

export async function runSimpleAgent(
    userQuestion: string
    ): Promise<AgentResult> {
    // 1️⃣ Ask LLM what to do
    const decisionPrompt = `
        You are an AI agent.

        Available tools:
        - search_knowledge_base(query)
        - calculator(expression)

        If a tool is needed, respond ONLY in JSON:
        {
        "tool": "<tool_name>",
        "input": { ... }
        }

        Otherwise, answer normally.
        `;

    const decision = await chatWithLLM([
        { role: "system", content: decisionPrompt },
        { role: "user", content: userQuestion }
    ]);
    console.log("LLM Decision -", decision);
    // 2️⃣ Try parsing tool call
    try {
        const parsed = JSON.parse(decision.content);
        console.log("Parsed -", parsed);

        if (parsed.tool) {
            // 3️⃣ Execute tool
            const toolResult = await executeTool(
                AVAILABLE_TOOLS,
                parsed.tool,
                parsed.input
            );

            // 4️⃣ Send tool result back to LLM
            const finalAnswer = await chatWithLLM([
                { role: "system", content: "Use tool result to answer user." },
                {
                    role: "user",
                    content: `User question: ${userQuestion} Tool result: ${JSON.stringify(toolResult)}`
                }
            ]);

            return {
                answer: finalAnswer.content,
                toolUsed: parsed.tool
            };
        }
    } catch {
        // Not a tool call, fall through
    }

    // 5️⃣ Direct answer
    return {
        answer: decision.content
    };
}
