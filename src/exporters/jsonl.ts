import type { MetricsSnapshot } from "../types.js";
import { Writable } from "node:stream";

export function exportJSONL(snap: MetricsSnapshot, out: Writable): void {
  for (const c of snap.counters) out.write(JSON.stringify({ type: "counter", ...c }) + "\n");
  for (const g of snap.gauges) out.write(JSON.stringify({ type: "gauge", ...g }) + "\n");
  for (const h of snap.histograms) out.write(JSON.stringify({ type: "histogram", ...h }) + "\n");
}