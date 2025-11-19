import type { MetricsSnapshot } from "../types.js";

function escLabelValue(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"');
}

export function prometheusText(snap: MetricsSnapshot): string {
  const lines: string[] = [];
  // Counters
  const groupedC = groupByName(snap.counters);
  for (const [name, arr] of groupedC) {
    if (arr[0]?.help) lines.push(`# HELP ${name} ${arr[0].help}`);
    lines.push(`# TYPE ${name} counter`);
    for (const c of arr) lines.push(formatSample(name, c.labels, c.value));
  }
  // Gauges
  const groupedG = groupByName(snap.gauges);
  for (const [name, arr] of groupedG) {
    if (arr[0]?.help) lines.push(`# HELP ${name} ${arr[0].help}`);
    lines.push(`# TYPE ${name} gauge`);
    for (const g of arr) lines.push(formatSample(name, g.labels, g.value));
  }
  // Histograms
  const groupedH = groupByName(snap.histograms);
  for (const [name, arr] of groupedH) {
    if (arr[0]?.help) lines.push(`# HELP ${name} ${arr[0].help}`);
    lines.push(`# TYPE ${name} histogram`);
    for (const h of arr) {
      for (const b of h.buckets) {
        lines.push(formatSample(`${name}_bucket`, { ...h.labels, le: String(b.le) }, b.count));
      }
      lines.push(formatSample(`${name}_count`, h.labels, h.count));
      lines.push(formatSample(`${name}_sum`, h.labels, h.sum));
    }
  }
  return lines.join("\n") + "\n";
}

function formatSample(name: string, labels: Record<string, string>, value: number): string {
  const keys = Object.keys(labels);
  if (keys.length === 0) return `${name} ${value}`;
  const body = keys.map((k) => `${k}="${escLabelValue(labels[k] ?? "")}"`).join(",");
  return `${name}{${body}} ${value}`;
}

function groupByName<T extends { name: string }>(arr: T[]): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const x of arr) {
    const list = m.get(x.name) ?? [];
    list.push(x);
    m.set(x.name, list);
  }
  return m;
}
