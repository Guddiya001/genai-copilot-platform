export function sanitizeInput(input: string): string {
  return input
    .replace(/\u0000/g, "") // null bytes
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function validateInput(input: string) {
  if (!input || input.length < 2) {
    throw new Error("Input too short");
  }

  if (input.length > 4000) {
    throw new Error("Input too long");
  }
}
