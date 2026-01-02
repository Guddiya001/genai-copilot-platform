import { createEmbeddingByGemini } from "../embeddings/embeddingClient";
import { vectorStore } from "../vectorstore/inMemoryVectorStore";
import { buildContext } from "./contextBuilder";
import { buildRagPrompt } from "./ragPrompt";
import { chatWithLLM } from "../services/llmClient";
import { checkHallucination } from "../eval/hallucinationCheck";
import { recallMemory, saveMemory } from "../memory/memoryService";



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
  console.log("Vector store size:", vectorStore.size());
  
  // 2. Retrieve relevant chunks
  const results = vectorStore.search(queryEmbedding, 5);
  console.log("Search results:", results);

  // 3. Build context
  const context = buildContext(results);

  console.log("RAG context:", context, question);

  if (!context) {
    return {
      answer: "I don't know",
      sources: [],
      evaluation: {  hallucinated: false, score: 1 }
    };
  }

const userId = "demo-user";// later, get from auth context

const memoryContent = await recallMemory(userId, question);
const combinedContext = `Past conversations:\n${memoryContent} 
Retrieved documents: ${context}`; 
  // 4. Build RAG prompt
  const { system, user } = buildRagPrompt(combinedContext, question);

  // 5. Generate answer
  const response = await chatWithLLM([
    { role: "system", content: system },
    { role: "user", content: user }
  ]);

await saveMemory(userId, question);
await saveMemory(userId, response.content);


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
