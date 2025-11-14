import { describe, it, expect } from "vitest";
import { MeterRegistry } from "../core/registry.js";
import { httpMetrics } from "../instrumentation/http.js";

describe("HTTP instrumentation", () => {
  it("instruments handler and records counters/histograms", async () => {
    const m = new MeterRegistry();
    const inst = httpMetrics(m);
    const req: any = { method: "GET" };
    const res: any = { statusCode: 200 };
    await inst(req, res, "/x", async () => { /* work */ });
    const snap = m.snapshot();
    const c = snap.counters.find(c => c.name === "http_requests_total");
    const h = snap.histograms.find(h => h.name === "http_request_duration_seconds");
    expect(c?.value).toBe(1);
    expect(h?.count).toBe(1);
  });

  it("records 500 on handler throw", async () => {
    const m = new MeterRegistry();
    const inst = httpMetrics(m);
    const req: any = { method: "POST" };
    const res: any = { statusCode: 200 };
    await expect(inst(req, res, "/err", async () => { throw new Error("boom"); })).rejects.toThrow();
    const c = m.snapshot().counters.find(c => c.labels.path === "/err");
    expect(c?.labels.code).toBe("500");
  });
});