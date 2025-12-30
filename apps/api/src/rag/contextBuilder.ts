import { SearchResult } from "../vectorstore/vectorTypes";

interface ContextOptions {
  maxChunks?: number;
  maxCharacters?: number;
}

export function buildContext(
  results: SearchResult[],
  options: ContextOptions = {}
): string {
  const maxChunks = options.maxChunks ?? 4;
  const maxCharacters = options.maxCharacters ?? 1500;

  let context = "";
  let usedChars = 0;

  for (const result of results.slice(0, maxChunks)) {
    const text = result.metadata?.text;
    if (!text) continue;

    if (usedChars + text.length > maxCharacters) break;

    context += `\n---\n${text}`;
    usedChars += text.length;
  }

  return context.trim();
}
