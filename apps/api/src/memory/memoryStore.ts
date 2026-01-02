import { MemoryRecord } from "./memoryTypes";
import { cosineSimilarity } from "../vectorstore/cosine";

export class MemoryStore {
  private memories: MemoryRecord[] = [];

  add(memory: MemoryRecord) {
    this.memories.push(memory);
  }

  search(userId: string, queryEmbedding: number[], topK = 3) {
    return this.memories
      .filter(m => m.userId === userId)
      .map(m => ({
        memory: m,
        score: cosineSimilarity(queryEmbedding, m.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(r => r.memory);
  }
}

export const memoryStore = new MemoryStore();
