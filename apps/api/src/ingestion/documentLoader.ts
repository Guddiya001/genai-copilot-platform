export interface RawDocument {
  id: string;
  content: string;
  metadata?: Record<string, any>;
}

export function loadTextDocument(
  text: string,
  metadata?: Record<string, any>
): RawDocument {
  return {
    id: crypto.randomUUID(),
    content: text,
    metadata
  };
}
