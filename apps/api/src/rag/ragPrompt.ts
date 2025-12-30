export function buildRagPrompt(
  context: string,
  question: string
): { system: string; user: string } {
  return {
    system: `
You are a knowledge-based AI assistant.

Rules:
- Answer ONLY using the provided context.
- If the answer is not in the context, say "I don't know".
- Do not add external knowledge.
- Be concise and factual.
`,
    user: `
Context:
${context}

Question:
${question}
`
  };
}
