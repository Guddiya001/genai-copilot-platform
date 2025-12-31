import { Tool } from "./tools";

export async function executeTool(
  tools: Tool[],
  toolName: string,
  toolInput: any
) {
  const tool = tools.find(t => t.name === toolName);

  if (!tool) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  return await tool.execute(toolInput);
}
