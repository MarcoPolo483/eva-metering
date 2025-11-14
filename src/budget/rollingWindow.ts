export type RollingWindowOpts = { windowMs: number; limit: number; now?: () => number };

export class RollingWindowQuota {
  private hits = new Map<string, number[]>();
  private nowFn: () => number;

  constructor(private readonly opts: RollingWindowOpts) {
    if (opts.windowMs <= 0 || opts.limit < 1) throw new Error("Invalid quota options");
    this.nowFn = opts.now ?? (() => Date.now());
  }

  hit(key: string): boolean {
    const now = this.nowFn();
    const from = now - this.opts.windowMs;
    const arr = this.hits.get(key) ?? [];
    // prune
    const kept = arr.filter((t) => t >= from);
    if (kept.length >= this.opts.limit) {
      this.hits.set(key, kept);
      return false;
    }
    kept.push(now);
    this.hits.set(key, kept);
    return true;
  }

  count(key: string): number {
    const now = this.nowFn();
    const from = now - this.opts.windowMs;
    const arr = this.hits.get(key) ?? [];
    const kept = arr.filter((t) => t >= from);
    this.hits.set(key, kept);
    return kept.length;
  }
}