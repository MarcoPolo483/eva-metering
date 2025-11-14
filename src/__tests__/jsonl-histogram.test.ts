import { describe, it, expect } from "vitest";
import { MeterRegistry } from "../core/registry.js";
import { exportJSONL } from "../exporters/jsonl.js";
import { PassThrough } from "node:stream";

describe("JSONL exporter covers histogram entries", () => {
  it("writes histogram lines to stream", () => {
    const m = new MeterRegistry();
    const h = m.histogram("op_seconds", "op time", ["op"], [0.1, 1, 10]);
    h.observe({ op: "x" }, 0.2);
    const out = new PassThrough();
    exportJSONL(m.snapshot(), out);
    const buf = out.read() as Buffer;
    const s = String(buf);
    expect(s).toContain('"type":"histogram"');
    expect(s).toContain('"name":"op_seconds"');
    expect(s).toContain('"count":1');
  });
});