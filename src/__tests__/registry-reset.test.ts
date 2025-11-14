import { describe, it, expect } from "vitest";
import { MeterRegistry } from "../core/registry.js";

describe("MeterRegistry reset and multiple snapshots", () => {
  it("reset clears all metric series", () => {
    const m = new MeterRegistry();
    m.counter("c", undefined, ["a"]).inc({ a: "x" }, 1);
    m.gauge("g", undefined, ["a"]).set({ a: "x" }, 2);
    m.histogram("h", undefined, ["a"]).observe({ a: "x" }, 0.1);

    let snap = m.snapshot();
    expect(snap.counters.length).toBe(1);
    expect(snap.gauges.length).toBe(1);
    expect(snap.histograms.length).toBe(1);

    m.reset();
    snap = m.snapshot();
    expect(snap.counters.length).toBe(0);
    expect(snap.gauges.length).toBe(0);
    expect(snap.histograms.length).toBe(0);
  });

  it("supports multiple label series per metric name", () => {
    const m = new MeterRegistry();
    const c = m.counter("events_total", "events", ["type"]);
    c.inc({ type: "a" }, 1);
    c.inc({ type: "b" }, 2);
    const snap = m.snapshot();
    const rows = snap.counters.filter((x) => x.name === "events_total");
    expect(rows).toHaveLength(2);
    const a = rows.find((r) => r.labels.type === "a")!;
    const b = rows.find((r) => r.labels.type === "b")!;
    expect(a.value).toBe(1);
    expect(b.value).toBe(2);
  });
});