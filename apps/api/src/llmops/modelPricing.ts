export interface ModelPrice {
  inputPer1K: number;
  outputPer1K: number;
}

export const MODEL_PRICING: Record<string, ModelPrice> = {
  "gpt-3.5": {
    inputPer1K: 0.0005,
    outputPer1K: 0.0015
  },
  "gpt-4": {
    inputPer1K: 0.03,
    outputPer1K: 0.06
  },
  "gemini": {
    inputPer1K: 0.00025,
    outputPer1K: 0.0005
  }
};
