import { useState, useRef } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([            {
                id: '1',
                content: 'Hello! 👋 I\'m your AI assistant. How can I help you today?',
                role: 'assistant',
                timestamp: new Date(),
            },]);
  const [isStreaming, setIsStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const sendMessage = async (userInput: string) => {
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsStreaming(true);

  
    // Add user message
    setMessages((prev) => [
      ...prev,
      {id: Date.now().toString(), role: "user", content: userInput, timestamp: new Date() },
      { id: (Date.now() + 1).toString(), role: "assistant", content: "", timestamp: new Date() }
    ]);

    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userInput }]
      }),
      signal: controller.signal
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let assistantText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;

        const payload = JSON.parse(line.replace("data:", "").trim());

        if (payload.token) {
          assistantText += payload.token;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
                id: updated[updated.length - 1].id,
                role: "assistant",
                content: assistantText,
                timestamp: new Date()
            };
            return updated;
          });
        }

        if (payload.done) {
          setIsStreaming(false);
          reader.cancel();
          return;
        }
      }
    }
  };

  const stopStreaming = () => {
    controllerRef.current?.abort();
    setIsStreaming(false);
  };

  return {
    messages,
    sendMessage,
    stopStreaming,
    isStreaming
  };
}
