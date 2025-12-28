export interface Chunk {
  id: string;
  text: string;
  index: number;
}

interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

export function chunkText(
  text: string,
  options: ChunkOptions = {}
): Chunk[] {
  const chunkSize = options.chunkSize ?? 500;
  const overlap = options.overlap ?? 100;

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = start + chunkSize;
    const chunkText = text.slice(start, end);

    chunks.push({
      id: crypto.randomUUID(),
      text: chunkText,
      index
    });

    index++;
    start += chunkSize - overlap;
  }

  return chunks;
}
