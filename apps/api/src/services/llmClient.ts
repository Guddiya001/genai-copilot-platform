// import OpenAI from "openai";

// export interface ChatMessage {
//   role: "system" | "user" | "assistant";
//   content: string;
// }

// export interface ChatResponse {
//   content: string;
// }

// type Provider = "openai" | "azure" | "none";

// function detectProvider(): Provider {
//   if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_DEPLOYMENT) {
//     return "azure";
//   }
//   if (process.env.OPENAI_API_KEY) return "openai";
//   return "none";
// }

// async function callAzureChat(messages: ChatMessage[], deployment: string) {
//   const endpoint = process.env.AZURE_OPENAI_ENDPOINT!; // validated by caller
//   const apiKey = process.env.AZURE_OPENAI_API_KEY!;
//   const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2023-05-15";

//   const url = `${endpoint.replace(/\/$/, "")}/openai/deployments/${encodeURIComponent(
//     deployment
//   )}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;

//   // Build messages in the shape Azure expects
//   const body = {
//     messages: messages.map((m) => ({ role: m.role, content: m.content })),
//     max_tokens: 800,
//     temperature: 0.2
//   };

//   const resp = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "api-key": apiKey
//     },
//     body: JSON.stringify(body)
//   });

//   if (!resp.ok) {
//     const text = await resp.text();
//     throw new Error(`Azure OpenAI error: ${resp.status} ${text}`);
//   }

//   const data = await resp.json();
//   const content = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? null;
//   return content ?? "[ERROR] No content returned from Azure OpenAI";
// }

// async function callOpenAIChat(messages: ChatMessage[], model: string) {
//   const apiKey = process.env.OPENAI_API_KEY!;
//   const client = new OpenAI({ apiKey });
//   const completion = await client.chat.completions.create({ model, messages });
//   const content = completion.choices[0]?.message?.content?.toString() ?? null;
//   return content ?? "[ERROR] No content returned from OpenAI";
// }

// export async function chatWithLLM(
//   messages: ChatMessage[],
//   model = process.env.OPENAI_MODEL || "gpt-4o-mini"
// ): Promise<ChatResponse> {
//   const provider = detectProvider();

//   if (provider === "azure") {
//     const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;
//     try {
//       const content = await callAzureChat(messages, deployment);
//       return { content };
//     } catch (err) {
//       throw err;
//     }
//   }

//   if (provider === "openai") {
//     try {
//       const content = await callOpenAIChat(messages, model);
//       return { content };
//     } catch (err) {
//       throw err;
//     }
//   }

//   // Fallback: echo the last user message
//   const lastUser = messages.slice().reverse().find((m) => m.role === "user");
//   const echo = lastUser ? `OPENAI_API_KEY not set. Echo: ${lastUser.content}` : "OPENAI_API_KEY not set.";
//   return { content: echo };
// }


import OpenAI from "openai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  content: string;
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
