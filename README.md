# eva-metering (Enterprise Edition)

Metering and cost control for EVA 2.0 without external deps:
- Metrics: Counter, Gauge, Histogram, Timer with labels
- Exporters: Prometheus (text exposition), JSONL, in-memory snapshot
- Budgets/Quotas: Token bucket and rolling-window quotas per key
- LLM Metering: Token usage → cost via model price table (prompt/completion per 1K tokens)
- Instrumentation: Node HTTP middleware, simple timers
- Enterprise toolchain: ESLint v9, Prettier, Vitest ≥80% coverage, Husky

Examples
```ts
import { MeterRegistry, costOfTokensUSD, DEFAULT_PRICES } from "./dist/index.js";

const meter = new MeterRegistry();
const httpReqs = meter.counter("http_requests_total", "HTTP requests", ["method", "code"]);
const httpLat = meter.histogram("http_request_duration_seconds", "Request latency sec", ["method", "code"]);

httpReqs.inc({ method: "GET", code: "200" }, 1);
const end = meter.timer().start();
await doWork();
httpLat.observe({ method: "GET", code: "200" }, end());

const usd = costOfTokensUSD({ model: "gpt-4o", promptTokens: 500, completionTokens: 100 }, DEFAULT_PRICES);
```

Prometheus export
```ts
import { prometheusText } from "./dist/index.js";
const text = prometheusText(meter.snapshot());
// expose at /metrics in eva-api
```

Budgets/Quotas
```ts
import { TokenBucket, RollingWindowQuota } from "./dist/index.js";
const bucket = new TokenBucket({ capacity: 1000, refillPerSec: 50 });
bucket.take(75); // throws if not enough

const quota = new RollingWindowQuota({ windowMs: 60_000, limit: 100 });
quota.hit("tenantA"); // returns allowed:boolean
```