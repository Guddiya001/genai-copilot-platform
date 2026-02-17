import OpenAI from "openai";
import { estimateTokens } from "../llmops/tokenEstimator";
import { MODEL_PRICING } from "../llmops/modelPricing";
import { recordUsage } from "../llmops/usageStore";
import { enforceBudget } from "../llmops/costGuard";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  content: string;
}

interface LLMCallOptions {
  userId: string;
  model: string;
}

/**
 * Detect provider based on env
 */
const isAzure =
  !!process.env.AZURE_OPENAI_API_KEY &&
  !!process.env.AZURE_OPENAI_ENDPOINT;

let client: OpenAI;

if (isAzure) {
  client = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
    defaultQuery: {
      "api-version": process.env.AZURE_OPENAI_API_VERSION
    },
    defaultHeaders: {
      "api-key": process.env.AZURE_OPENAI_API_KEY
    }
  });

  console.log("✅ Using Azure OpenAI");
} else {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  console.log("✅ Using OpenAI Public API");
}



/* ---------- Non-streaming ---------- */

export async function chatWithLLMCostEffective(
  messages: ChatMessage[],
  options: LLMCallOptions
){
  const userId = options.userId || "anonymous";
  const model = options.model || process.env.OPENAI_MODEL || "gpt-3.5";

  // Enforce budget before making the call
  enforceBudget(userId);

  const inputText = messages.map(m => m.content).join("\n");
  const inputTokens = estimateTokens(inputText);

  const response = await client.chat.completions.create({
    model: isAzure
      ? process.env.AZURE_OPENAI_DEPLOYMENT_NAME!
      : model,
    messages
  });

  const outputTokens = estimateTokens(response.choices[0].message.content || "");

 
  const pricing = MODEL_PRICING[model] || MODEL_PRICING["gpt-3.5"];
  const cost =
    (inputTokens / 1000) * pricing.inputPer1K +
    (outputTokens / 1000) * pricing.outputPer1K;
  // Record usage after the call
  recordUsage(userId, inputTokens + outputTokens, cost);


  return {
    content:
      response.choices[0]?.message?.content ??
      "[No response returned]"
  };

}

/* ---------- Non-streaming old---------- */
export async function chatWithLLM(
  messages: ChatMessage[],
  model = process.env.OPENAI_MODEL || "gpt-35-turbo"
): Promise<ChatResponse> {
  // ⚠️ Azure uses deployment instead of model
  const completion = await client.chat.completions.create({
    model: isAzure
      ? process.env.AZURE_OPENAI_DEPLOYMENT_NAME!
      : model,
    messages
  });

  return {
    content:
      completion.choices[0]?.message?.content ??
      "[No response returned]"
  };
}

/* ---------- Streaming ---------- */

export async function streamChatWithLLM(
  messages: ChatMessage[],
  onToken: (token: string) => void
): Promise<void> {
  const stream = await client.chat.completions.create({
    model: isAzure
      ? process.env.AZURE_OPENAI_DEPLOYMENT_NAME!
      : "gpt-4.1-mini",
    messages,
    stream: true
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) {
      onToken(token);
    }
  }
}
