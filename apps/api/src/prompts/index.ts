import { CHAT_V1_PROMPT, CHAT_V2_STRICT_PROMPT } from "./chatPrompts";
import { PromptTemplate } from "./basePrompt";

export const PROMPT_REGISTRY: Record<string, PromptTemplate> = {
  "chat:v1": CHAT_V1_PROMPT,
  "chat:v2": CHAT_V2_STRICT_PROMPT
};

export function getPrompt(key: string): PromptTemplate {
  const prompt = PROMPT_REGISTRY[key];
  if (!prompt) {
    throw new Error(`Prompt not found: ${key}`);
  }
  return prompt;
}
