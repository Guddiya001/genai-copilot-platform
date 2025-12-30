import { createEmbeddingByGemini } from "../embeddings/embeddingClient";
import { vectorStore } from "../vectorstore/inMemoryVectorStore";
import { buildContext } from "./contextBuilder";
import { buildRagPrompt } from "./ragPrompt";
import { chatWithLLM } from "../services/llmClient";
import { checkHallucination } from "../eval/hallucinationCheck";



interface RagAnswer {
  answer: string;
  sources: string[];
  evaluation?: { hallucinated: boolean; score: number };
}

export async function answerWithRag(
  question: string
): Promise<RagAnswer> {
  // 1. Embed query
  const queryEmbedding = await createEmbeddingByGemini(question);

  // 2. Retrieve relevant chunks
  const results = vectorStore.search(queryEmbedding, 5);

  // 3. Build context
  const context = buildContext(results);

  if (!context) {
    return {
      answer: "I don't know",
      sources: [],
      evaluation: {  hallucinated: false, score: 1 }
    };
  }

  // 4. Build RAG prompt
  const { system, user } = buildRagPrompt(context, question);

  // 5. Generate answer
  const response = await chatWithLLM([
    { role: "system", content: system },
    { role: "user", content: user }
  ]);


  // 5a. Evaluate hallucination
  const evaluation = checkHallucination(response.content, context);
  // 6. Collect sources
  const sources = results
    .map(r => r.metadata?.source || r.metadata?.documentId)
    .filter(Boolean);

  return {
    answer: response.content,
    sources,
    evaluation
  };
}
