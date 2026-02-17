import { createEmbeddingByGemini } from "../embeddings/embeddingClient";
import { vectorStore } from "../vectorstore/inMemoryVectorStore";
import { buildContext } from "./contextBuilder";
import { buildRagPrompt } from "./ragPrompt";
import { chatWithLLMCostEffective } from "../services/llmClient";
import { checkHallucination } from "../eval/hallucinationCheck";
import { recallMemory, saveMemory } from "../memory/memoryService";
import { validateOutput } from "../security/outputGuard";
import { chooseModel } from "../llmops/modelRouter";
import { completeTrace } from "../observability/tracer";

interface RagAnswer {
  answer: string;
  sources: string[];
  evaluation?: { hallucinated: boolean; score: number };
}

export async function answerWithRag(
  question: string,
  traceId?: string
): Promise<RagAnswer> {

  const userId = "demo-user";

  let documentContext = "";
  let results: any[] = [];

  // Choose model once, use everywhere
  const model = chooseModel("rag");

  try {

    /* -----------------------------
       1. Embed query
    ------------------------------ */
    const queryEmbedding =
      await createEmbeddingByGemini(question);

    console.log("Vector store size:", vectorStore.size());

    /* -----------------------------
       2. Retrieve chunks
    ------------------------------ */
    results = vectorStore.search(queryEmbedding, 5);

    console.log("Search results:", results);

    /* -----------------------------
       3. Build context
    ------------------------------ */
    documentContext = buildContext(results);

    console.log("RAG context:", documentContext);

  } catch (err: any) {

    console.log("traceId", traceId, "Error in RAG retrieval:", err);
    if (traceId) {
      completeTrace(traceId, {
        model,
        retrievalCount: 0,
        success: false,
        error: err.message
      });
    }

    throw err;
  }

  /* -----------------------------
     4. Hybrid fallback
  ------------------------------ */
  if (!documentContext) {

    const fallback =
      await chatWithLLMCostEffective(
        [
          {
            role: "system",
            content:
              "Answer generally. Make it clear you are not using documents."
          },
          { role: "user", content: question }
        ],
        {
          userId,
          model
        }
      );

    if (traceId) {
      completeTrace(traceId, {
        model,
        retrievalCount: 0,
        success: true
      });
    }

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
     5. Recall memory
  ------------------------------ */
  let memoryContext = "";

  try {
    memoryContext =
      await recallMemory(userId, question);
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
  const { system, user } =
    buildRagPrompt(combinedContext, question);

  /* -----------------------------
     7. Generate answer
  ------------------------------ */
  let responseContent = "";

  try {

    const response =
      await chatWithLLMCostEffective(
        [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        {
          userId,
          model
        }
      );

    validateOutput(response.content);

    responseContent = response.content;

  } catch (err: any) {

    if (traceId) {
      completeTrace(traceId, {
        model,
        retrievalCount: results.length,
        success: false,
        error: err.message
      });
    }

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
  saveMemory(userId, question).catch(() => {});
  saveMemory(userId, responseContent).catch(() => {});

  /* -----------------------------
     9. Evaluate grounding
  ------------------------------ */
  const evaluation =
    checkHallucination(responseContent, documentContext);

  /* -----------------------------
     10. Sources
  ------------------------------ */
  const sources =
    results
      .map(r =>
        r.metadata?.source ||
        r.metadata?.documentId
      )
      .filter(Boolean);

  /* -----------------------------
     11. Complete trace SUCCESS
  ------------------------------ */
  if (traceId) {
    completeTrace(traceId, {
      model,
      retrievalCount: results.length,
      success: true
    });
  }

  return {
    answer: responseContent,
    sources,
    evaluation
  };
}
