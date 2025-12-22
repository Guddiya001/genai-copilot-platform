import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1)
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1)
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequestBody = z.infer<typeof chatRequestSchema>;
