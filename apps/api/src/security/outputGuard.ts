export function validateOutput(output: string) {
  if (!output) return;

  // Prevent accidental prompt leaks
  if (output.toLowerCase().includes("system prompt")) {
    throw new Error("Unsafe output detected");
  }
}
