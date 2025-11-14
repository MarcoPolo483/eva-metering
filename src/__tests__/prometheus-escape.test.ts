import { describe, it, expect } from "vitest";
import { MeterRegistry } from "../core/registry.js";
import { prometheusText } from "../exporters/prometheus.js";

describe("Prometheus exporter escaping and formats", () => {
  it("escapes quotes, backslashes, and newlines in label values", () => {
    const m = new MeterRegistry();
    const c = m.counter("sample_total", "Sample counter", ["k"]);
    c.inc({ k: String('He said: "hi" \\ new\nline') }, 3);
    const text = prometheusText(m.snapshot());
    // HELP/TYPE present
    expect(text).toMatch(/^# HELP sample_total Sample counter/m);
    expect(text).toMatch(/^# TYPE sample_total counter/m);
    // Escapes: \" for quotes, \\ for backslash, \n for newline
    expect(text).toMatch(/sample_total\{k="He said: \\"hi\\" \\\\ new\\nline"\} 3/);
  });

  it("emits gauge with no labels as a bare metric line", () => {
    const m = new MeterRegistry();
    const g = m.gauge("up", "Up gauge");
    g.set({}, 1);
    const text = prometheusText(m.snapshot());
    // No labels -> no {...}
    expect(text).toMatch(/# TYPE up gauge/);
    expect(text).toMatch(/^up 1$/m);
  });

  it("emits histogram buckets/count/sum with le label", () => {
    const m = new MeterRegistry();
    const h = m.histogram("latency_seconds", "Latency", ["route"], [0.5, 1, 2.5]);
    h.observe({ route: "/a" }, 0.7);
    h.observe({ route: "/a" }, 2.0);
    const text = prometheusText(m.snapshot());
    // Buckets with le label
    expect(text).toMatch(/latency_seconds_bucket\{route="\/a",le="0.5"\} \d+/);
    expect(text).toMatch(/latency_seconds_bucket\{route="\/a",le="1"\} \d+/);
    expect(text).toMatch(/latency_seconds_count\{route="\/a"\} 2/);
    expect(text).toMatch(/latency_seconds_sum\{route="\/a"\} [0-9.]+/);
  });
});