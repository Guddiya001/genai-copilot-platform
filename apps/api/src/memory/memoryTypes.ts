export interface MemoryRecord {
  id: string;
  userId: string;
  content: string;
  embedding: number[];
  timestamp: number;
}
