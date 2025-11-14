import { describe, it, expect } from "vitest";
import { costOfTokensUSD } from "../llm/cost.js";

describe("Cost rounding to 2 decimals", () => {
  it("rounds half-up to two decimals", () => {
    // Custom price table inline to force a fractional result
    const prices = { modelX: { promptPer1K: 0.3333, completionPer1K: 0.6666 } };
    const usd = costOfTokensUSD({ model: "modelX", promptTokens: 1500, completionTokens: 2500 }, prices as any);
    // (1.5 * 0.3333) + (2.5 * 0.6666) = 0.49995 + 1.6665 = 2.16645 -> 2.17 after rounding
    expect(usd).toBe(2.17);
  });
});