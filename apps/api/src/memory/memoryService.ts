import { createEmbeddingByGemini } from "../embeddings/embeddingClient";
import { memoryStore } from "./memoryStore";
import { MemoryRecord } from "./memoryTypes";

export async function saveMemory(
  userId: string,
  content: string
) {
  const embedding = await createEmbeddingByGemini(content);

  const record: MemoryRecord = {
    id: crypto.randomUUID(),
    userId,
    content,
    embedding,
    timestamp: Date.now()
  };

  memoryStore.add(record);
}

export async function recallMemory(
  userId: string,
  query: string
): Promise<string> {
  const queryEmbedding = await createEmbeddingByGemini(query);

  const memories = memoryStore.search(
    userId,
    queryEmbedding
  );

  return memories.map(m => m.content).join("\n");
}
