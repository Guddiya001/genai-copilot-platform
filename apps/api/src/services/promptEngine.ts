import { ChatMessage } from "./llmClient";
import { getPrompt } from "../prompts";
import { sanitizeUserInput } from "../security/promptSanitizer";
import { BASE_SYSTEM_RULES } from "../prompts/basePrompt";

interface BuildPromptOptions {
  promptKey?: string;
}

export function buildChatMessages(
  userMessages: ChatMessage[],
  options?: BuildPromptOptions
): ChatMessage[] {
  const promptKey = options?.promptKey ?? "chat:v1";
  const prompt = getPrompt(promptKey);

  const systemMessage: ChatMessage = {
    role: "system",
    content: `
${BASE_SYSTEM_RULES}

${prompt.system}
`
  };

  const sanitizedMessages: ChatMessage[] = userMessages.map((msg) => {
    if (msg.role !== "user") return msg;

    return {
      ...msg,
      content: sanitizeUserInput(msg.content)
    };
  });

  return [systemMessage, ...sanitizedMessages];
}
