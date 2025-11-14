import { SystemClock } from "../util/clock.js";
import type { Labels, MetricsSnapshot } from "../types.js";
import { Counter, Gauge, Histogram, Timer } from "./metric.js";

type Def = { help?: string; labels?: string[] };
export class MeterRegistry {
  private counters = new Map<string, Counter>();
  private gauges = new Map<string, Gauge>();
  private histograms = new Map<string, Histogram>();
  private clock = new SystemClock();

  counter(name: string, help?: string, labels?: string[]) {
    const c = new Counter(name, help, labels ?? []);
    this.counters.set(name, c);
    return c;
  }
  gauge(name: string, help?: string, labels?: string[]) {
    const g = new Gauge(name, help, labels ?? []);
    this.gauges.set(name, g);
    return g;
  }
  histogram(name: string, help?: string, labels?: string[], buckets?: number[]) {
    const h = new Histogram(name, help, buckets, labels ?? []);
    this.histograms.set(name, h);
    return h;
  }
  timer(): Timer {
    return new Timer(() => this.clock.hrtime());
  }

  snapshot(): MetricsSnapshot {
    return {
      counters: Array.from(this.counters.values()).flatMap((c) => c.snapshot()),
      gauges: Array.from(this.gauges.values()).flatMap((g) => g.snapshot()),
      histograms: Array.from(this.histograms.values()).flatMap((h) => h.snapshot())
    };
  }
  reset() {
    this.counters.forEach((c) => c.reset());
    this.gauges.forEach((g) => g.reset());
    this.histograms.forEach((h) => h.reset());
  }
}