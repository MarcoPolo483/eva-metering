import { describe, it, expect } from "vitest";
import { Counter, Gauge, Histogram, Timer } from "../core/metric.js";

describe("Metric core", () => {
  it("counter inc and snapshot with labels", () => {
    const c = new Counter("x", "help", ["a","b"]);
    c.inc({ a: "1", b: "2" }, 3);
    c.inc({ a: "1", b: "2" }, 2);
    const snap = c.snapshot();
    expect(snap[0].value).toBe(5);
    expect(snap[0].labels).toEqual({ a: "1", b: "2" });
  });

  it("gauge set/add and snapshot", () => {
    const g = new Gauge("g", undefined, ["k"]);
    g.set({ k: "x" }, 2);
    g.add({ k: "x" }, 3);
    expect(g.snapshot()[0].value).toBe(5);
  });

  it("histogram observe buckets and sum", () => {
    const h = new Histogram("h", "help", [0.1, 0.5], ["k"]);
    h.observe({ k: "x" }, 0.2);
    h.observe({ k: "x" }, 0.6);
    const s = h.snapshot()[0];
    expect(s.count).toBe(2);
    expect(s.buckets[0].count).toBe(0); // 0.2 > 0.1
    expect(s.buckets[1].count).toBe(1); // 0.2 <= 0.5
  });

  it("timer measures seconds", async () => {
    const t = new Timer(() => performance.now());
    const end = t.start();
    await new Promise(r => setTimeout(r, 5));
    const sec = end();
    expect(sec).toBeGreaterThan(0);
  });

  it("counter cannot be decremented", () => {
    const c = new Counter("c");
    expect(() => c.inc({}, -1)).toThrow();
  });
});