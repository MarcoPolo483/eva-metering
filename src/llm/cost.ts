export type Price = { promptPer1K: number; completionPer1K: number };
export type PriceTable = Record<string, Price>;

/** Default example prices in USD per 1K tokens. Adjust to your contracts. */
export const DEFAULT_PRICES: PriceTable = {
  "gpt-4o": { promptPer1K: 5.0, completionPer1K: 15.0 },
  "gpt-4o-mini": { promptPer1K: 0.15, completionPer1K: 0.6 }
};

export function costOfTokensUSD(
  usage: { model: string; promptTokens?: number; completionTokens?: number },
  prices: PriceTable = DEFAULT_PRICES
): number {
  const p = prices[usage.model];
  if (!p) return 0;
  const pt = usage.promptTokens ?? 0;
  const ct = usage.completionTokens ?? 0;
  return round2((pt / 1000) * p.promptPer1K + (ct / 1000) * p.completionPer1K);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}