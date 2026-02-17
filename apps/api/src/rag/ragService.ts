import { createEmbeddingByGemini } from "../embeddings/embeddingClient";
import { vectorStore } from "../vectorstore/inMemoryVectorStore";
import { buildContext } from "./contextBuilder";
import { buildRagPrompt } from "./ragPrompt";
import { chatWithLLM, chatWithLLMCostEffective } from "../services/llmClient";
import { checkHallucination } from "../eval/hallucinationCheck";
import { recallMemory, saveMemory } from "../memory/memoryService";
import { validateOutput } from "../security/outputGuard";
import { chooseModel } from "../llmops/modelRouter";


interface RagAnswer {
  answer: string;
  sources: string[];
  evaluation?: { hallucinated: boolean; score: number };
}

export async function answerWithRag(
  question: string
): Promise<RagAnswer> {

  const userId = "demo-user"; // later from auth

  /* -----------------------------
     1. Embed query
  ------------------------------ */
  const queryEmbedding = await createEmbeddingByGemini(question);

  console.log("Vector store size:", vectorStore.size());

  /* -----------------------------
     2. Retrieve chunks
  ------------------------------ */
  const results = vectorStore.search(queryEmbedding, 5);
  console.log("Search results:", results);

  /* -----------------------------
     3. Build context
  ------------------------------ */
  const documentContext = buildContext(results);
  console.log("RAG context:", documentContext);

  /* -----------------------------
     4. Hybrid fallback (safe)
  ------------------------------ */
  if (!documentContext) {
    const fallback = await chatWithLLM([
      {
        role: "system",
        content:
          "Answer generally. Make it clear you are not using documents."
      },
      { role: "user", content: question }
    ]);

    return {
      answer: fallback.content,
      sources: [],
      evaluation: {
        hallucinated: false,
        score: 0
      }
    };
  }

  /* -----------------------------
     5. Recall memory (best effort)
  ------------------------------ */
  let memoryContext = "";
  try {
    memoryContext = await recallMemory(userId, question);
  } catch {
    memoryContext = "";
  }

  const combinedContext = `
  Past conversations:
  ${memoryContext || "None"}

  Retrieved documents:
  ${documentContext}
  `.trim();

  /* -----------------------------
     6. Build prompt
  ------------------------------ */
  const { system, user } = buildRagPrompt(
    combinedContext,
    question
  );

  /* -----------------------------
     7. Generate answer (guarded)
  ------------------------------ */
  let responseContent = "";
  try {
    const model = chooseModel("rag");

    const response = await chatWithLLMCostEffective(
      [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      {
        userId: userId,
        model: model
      }
    );

    validateOutput(response.content);
    responseContent = response.content;
  } catch (err) {
    return {
      answer:
        "I'm unable to provide a safe answer to that request.",
      sources: [],
      evaluation: {
        hallucinated: false,
        score: 1
      }
    };
  }

  /* -----------------------------
     8. Save memory (non-blocking)
  ------------------------------ */
  saveMemory(userId, question).catch(() => { });
  saveMemory(userId, responseContent).catch(() => { });

  /* -----------------------------
     9. Evaluate grounding
  ------------------------------ */
  const evaluation = checkHallucination(
    responseContent,
    documentContext
  );

  /* -----------------------------
     10. Sources
  ------------------------------ */
  const sources = results
    .map(r => r.metadata?.source || r.metadata?.documentId)
    .filter(Boolean);

  return {
    answer: responseContent,
    sources,
    evaluation
  };
}
