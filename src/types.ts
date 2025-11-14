export type Labels = Record<string, string>;

export type CounterSnapshot = { name: string; help?: string; labels: Labels; value: number };
export type GaugeSnapshot = { name: string; help?: string; labels: Labels; value: number };
export type HistogramBucket = { le: number; count: number };
export type HistogramSnapshot = {
  name: string; help?: string; labels: Labels;
  sum: number; count: number; buckets: HistogramBucket[];
};

export type MetricsSnapshot = {
  counters: CounterSnapshot[];
  gauges: GaugeSnapshot[];
  histograms: HistogramSnapshot[];
};