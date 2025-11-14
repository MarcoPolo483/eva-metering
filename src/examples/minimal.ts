import { MeterRegistry } from "../core/registry.js";
import { prometheusText } from "../exporters/prometheus.js";
import { costOfTokensUSD, DEFAULT_PRICES } from "../llm/cost.js";

async function main() {
  const meter = new MeterRegistry();
  const c = meter.counter("events_total", "Total events", ["type"]);
  c.inc({ type: "start" });
  const h = meter.histogram("work_seconds", "Work time", ["op"]);
  const end = meter.timer().start();
  await new Promise((r) => setTimeout(r, 50));
  h.observe({ op: "demo" }, end());

  const usd = costOfTokensUSD({ model: "gpt-4o", promptTokens: 800, completionTokens: 200 }, DEFAULT_PRICES);
  // eslint-disable-next-line no-console
  console.log("USD:", usd);
  // eslint-disable-next-line no-console
  console.log(prometheusText(meter.snapshot()));
}
void main();