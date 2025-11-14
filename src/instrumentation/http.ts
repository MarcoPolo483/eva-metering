import type { IncomingMessage, ServerResponse } from "http";
import type { MeterRegistry } from "../core/registry.js";

export function httpMetrics(meter: MeterRegistry) {
  const reqs = meter.counter("http_requests_total", "HTTP requests", ["method", "code", "path"]);
  const lat = meter.histogram("http_request_duration_seconds", "HTTP request duration seconds", ["method", "code", "path"]);

  return async function instrument(req: IncomingMessage, res: ServerResponse, path: string, handler: () => Promise<void> | void) {
    const method = (req.method || "GET").toUpperCase();
    const end = meter.timer().start();
    let code = 200;
    try {
      await handler();
      code = res.statusCode || 200;
    } catch (e) {
      code = 500;
      throw e;
    } finally {
      const duration = end();
      reqs.inc({ method, code: String(code), path }, 1);
      lat.observe({ method, code: String(code), path }, duration);
    }
  };
}