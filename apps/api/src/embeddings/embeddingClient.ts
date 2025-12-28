import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const isAzure =
  !!process.env.AZURE_OPENAI_API_KEY &&
  !!process.env.AZURE_OPENAI_ENDPOINT;

export async function createEmbeddingByGemini(input: string): Promise<number[]> {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY
    });

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: input
    });

    return response.embeddings?.flatMap(embedding => embedding.values ?? []) ?? [];
  } catch (err: any) {
    console.error("createEmbeddingByGemini error:", err?.message ?? err);
    throw err;
  }
}


let embeddingClient: OpenAI;

if (isAzure) {
  embeddingClient = new OpenAI({
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
  embeddingClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  console.log("✅ Using OpenAI Public API");
}

console.log(`✅ Using ${isAzure ? "Azure OpenAI" : "OpenAI Public API"} for embeddings`);
console.log(embeddingClient);

export async function createEmbedding(input: string): Promise<number[]> {
  try {
    const response = await embeddingClient.embeddings.create({
      model: isAzure
        ? process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME!
        : process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
      input
    });

    console.log("createEmbedding response:", response);
    return response.data[0].embedding;
  } catch (err: any) {
    console.error("createEmbedding error:", err?.message ?? err);
    throw err;
  }
}

// New: test accessibility of candidate embedding models/deployments
export async function checkEmbeddingAccess(): Promise<Record<string, { ok: boolean; error?: string }>> {
  const candidates: string[] = [];

  if (isAzure) {
    if (process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME) {
      candidates.push(process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME);
    }
    // include common embedding model names as additional probes (may or may not be valid for Azure)
    candidates.push("text-embedding-3-small", "text-embedding-3-large", "gpt-35-turbo");
  } else {
    if (process.env.OPENAI_EMBEDDING_MODEL) {
      candidates.push(process.env.OPENAI_EMBEDDING_MODEL);
    }
    candidates.push("text-embedding-3-small", "text-embedding-3-large", "gpt-35-turbo");
  }

  const report: Record<string, { ok: boolean; error?: string }> = {};

  for (const model of [...new Set(candidates)]) {
    try {
      // small probe input
      const resp = await embeddingClient.embeddings.create({
        model,
        input: "test"
      });
      if (resp?.data?.[0]?.embedding && Array.isArray(resp.data[0].embedding)) {
        report[model] = { ok: true };
      } else {
        report[model] = { ok: false, error: "No embedding returned" };
      }
    } catch (err: any) {
      // capture status/message for diagnostics
      const msg = err?.message ?? String(err);
      report[model] = { ok: false, error: msg };
    }
  }

  return report;
}
