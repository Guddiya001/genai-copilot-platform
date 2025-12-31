export interface Tool {
  name: string;
  description: string;
  execute: (input: any) => Promise<any>;
}

/**
 * Example Tool: Search knowledge base (RAG)
 */
export const searchTool: Tool = {
  name: "search_knowledge_base",
  description: "Search internal knowledge base for relevant information",
  execute: async ({ query }: { query: string }) => {
    return {
      result: `Found relevant info for: ${query}`
    };
  }
};

/**
 * Example Tool: Simple calculator
 */
export const calculatorTool: Tool = {
  name: "calculator",
  description: "Perform basic arithmetic calculations",
  execute: async ({ expression }: { expression: string }) => {
    try {
      // ⚠️ Simple demo only
      const value = eval(expression);
      return { result: value };
    } catch {
      return { error: "Invalid expression" };
    }
  }
};

export const AVAILABLE_TOOLS: Tool[] = [
  searchTool,
  calculatorTool
];
