import type { Labels, HistogramBucket } from "../types.js";

export class Counter {
  constructor(public readonly name: string, public readonly help?: string, private readonly baseLabels: string[] = []) {}
  private values = new Map<string, number>();
  private key(lbls: Record<string, string>): string {
    const parts = this.baseLabels.map((k) => `${k}\x00${lbls[k] ?? ""}`);
    return parts.join("\x01");
  }
  inc(labels: Labels = {}, v = 1) {
    if (v < 0) throw new Error("Counter cannot be decremented");
    const k = this.key(labels);
    this.values.set(k, (this.values.get(k) ?? 0) + v);
  }
  snapshot() {
    const out: { name: string; help?: string; labels: Labels; value: number }[] = [];
    for (const [k, value] of this.values) {
      const labels = decodeLabels(k, this.baseLabels);
      out.push({ name: this.name, help: this.help, labels, value });
    }
    return out;
  }
  reset() { this.values.clear(); }
}

export class Gauge {
  constructor(public readonly name: string, public readonly help?: string, private readonly baseLabels: string[] = []) {}
  private values = new Map<string, number>();
  private key(lbls: Record<string, string>): string {
    const parts = this.baseLabels.map((k) => `${k}\x00${lbls[k] ?? ""}`);
    return parts.join("\x01");
  }
  set(labels: Labels = {}, v: number) {
    const k = this.key(labels);
    this.values.set(k, v);
  }
  add(labels: Labels = {}, v: number) {
    const k = this.key(labels);
    this.values.set(k, (this.values.get(k) ?? 0) + v);
  }
  snapshot() {
    const out: { name: string; help?: string; labels: Labels; value: number }[] = [];
    for (const [k, value] of this.values) {
      const labels = decodeLabels(k, this.baseLabels);
      out.push({ name: this.name, help: this.help, labels, value });
    }
    return out;
  }
  reset() { this.values.clear(); }
}

export class Histogram {
  private counts: number[]; private sum = 0; private obs = 0;
  constructor(
    public readonly name: string,
    public readonly help: string | undefined,
    private readonly buckets: number[] = [0.005,0.01,0.025,0.05,0.1,0.25,0.5,1,2.5,5,10],
    private readonly baseLabels: string[] = []
  ) {
    this.counts = new Array(buckets.length).fill(0);
  }
  private values = new Map<string, { counts: number[]; sum: number; count: number }>();
  private key(lbls: Record<string, string>): string {
    const parts = this.baseLabels.map((k) => `${k}\x00${lbls[k] ?? ""}`);
    return parts.join("\x01");
  }
  observe(labels: Labels = {}, v: number) {
    const k = this.key(labels);
    const rec = this.values.get(k) ?? { counts: new Array(this.buckets.length).fill(0), sum: 0, count: 0 };
    rec.sum += v; rec.count += 1;
    for (let i = 0; i < this.buckets.length; i++) {
      if (v <= this.buckets[i]) rec.counts[i] += 1;
    }
    this.values.set(k, rec);
  }
  snapshot() {
    const snaps: { name: string; help?: string; labels: Labels; sum: number; count: number; buckets: HistogramBucket[] }[] = [];
    for (const [k, rec] of this.values) {
      const labels = decodeLabels(k, this.baseLabels);
      const buckets = this.buckets.map((le, i) => ({ le, count: rec.counts[i] }));
      snaps.push({ name: this.name, help: this.help, labels, sum: rec.sum, count: rec.count, buckets });
    }
    return snaps;
  }
  reset() { this.values.clear(); }
}

export class Timer {
  constructor(private readonly now: () => number) {}
  start() {
    const start = this.now();
    return (labels?: Labels) => {
      const end = this.now();
      return (end - start) / 1000; // seconds
    };
  }
}

function decodeLabels(key: string, keys: string[]): Labels {
  const parts = key ? key.split("\x01") : [];
  const map: Labels = {};
  keys.forEach((k, i) => {
    const [_, v] = (parts[i] ?? `${k}\x00`).split("\x00");
    map[k] = v ?? "";
  });
  return map;
}