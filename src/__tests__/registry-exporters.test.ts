import { describe, it, expect } from "vitest";
import { MeterRegistry } from "../core/registry.js";
import { prometheusText } from "../exporters/prometheus.js";
import { exportJSONL } from "../exporters/jsonl.js";
import { PassThrough } from "node:stream";

describe("Registry and exporters", () => {
  it("produces prometheus exposition", () => {
    const m = new MeterRegistry();
    m.counter("http_requests_total", "HTTP requests", ["method"]).inc({ method: "GET" }, 2);
    const text = prometheusText(m.snapshot());
    expect(text).toMatch(/# TYPE http_requests_total counter/);
    expect(text).toMatch(/http_requests_total\{method="GET"\} 2/);
  });

  it("exports JSONL", () => {
    const m = new MeterRegistry();
    m.gauge("g", "help", ["k"]).set({ k: "v" }, 7);
    const out = new PassThrough();
    exportJSONL(m.snapshot(), out);
    const buf = out.read() as Buffer;
    const s = String(buf);
    expect(s).toMatch(/"type":"gauge"/);
    expect(s).toMatch(/"value":7/);
  });
});