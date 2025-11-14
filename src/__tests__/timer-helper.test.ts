import { describe, it, expect } from "vitest";
import { MeterRegistry } from "../core/registry.js";
import { timeToHistogram } from "../instrumentation/timer.js";

describe("Timer helper", () => {
  it("times async function into histogram", async () => {
    const m = new MeterRegistry();
    await timeToHistogram(m, "lat", { op: "x" }, async () => {
      await new Promise(r => setTimeout(r, 5));
      return 42;
    });
    const h = m.snapshot().histograms.find(h => h.name === "lat");
    expect(h?.count).toBe(1);
  });
});