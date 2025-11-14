import type { MeterRegistry } from "../core/registry.js";

export async function timeToHistogram<T>(
  registry: MeterRegistry,
  name: string,
  labels: Record<string, string>,
  fn: () => Promise<T>
): Promise<T> {
  const timer = registry.timer();
  const stop = timer.start();
  try {
    const result = await fn();
    const duration = stop(labels);
    registry.histogram(name).observe(labels, duration);
    return result;
  } catch (err) {
    const duration = stop(labels);
    registry.histogram(name).observe(labels, duration);
    throw err;
  }
}
