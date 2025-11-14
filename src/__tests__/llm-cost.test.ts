import { describe, it, expect } from "vitest";
import { costOfTokensUSD, DEFAULT_PRICES } from "../llm/cost.js";

describe("LLM cost", () => {
  it("computes cost with default prices", () => {
    const usd = costOfTokensUSD({ model: "gpt-4o", promptTokens: 2000, completionTokens: 1000 }, DEFAULT_PRICES);
    // 2k * $5/1k = $10, 1k * $15/1k = $15 => $25
    expect(usd).toBe(25);
  });

  it("returns 0 for unknown model", () => {
    const usd = costOfTokensUSD({ model: "unknown", promptTokens: 100, completionTokens: 100 }, DEFAULT_PRICES);
    expect(usd).toBe(0);
  });
});