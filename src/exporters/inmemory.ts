import type { MetricsSnapshot } from "../types.js";

export function cloneSnapshot(s: MetricsSnapshot): MetricsSnapshot {
  return JSON.parse(JSON.stringify(s));
}