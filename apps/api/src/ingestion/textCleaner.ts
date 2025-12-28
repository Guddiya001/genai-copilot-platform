export function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}
