export type TaskType =
  | "rag"
  | "general"
  | "agent"
  | "evaluation";

export function chooseModel(task: TaskType): string {
  switch (task) {
    case "rag":
      return "gemini";
    case "general":
      return "gpt-3.5";
    case "agent":
      return "gpt-4";
    default:
      return "gemini";
  }
}
