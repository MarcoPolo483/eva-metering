export type TokenBucketOpts = { capacity: number; refillPerSec: number; now?: () => number };

export class TokenBucket {
  private tokens: number;
  private last: number;
  private readonly nowFn: () => number;

  constructor(private readonly opts: TokenBucketOpts) {
    if (opts.capacity <= 0 || opts.refillPerSec < 0) throw new Error("Invalid bucket options");
    this.tokens = opts.capacity;
    this.nowFn = opts.now ?? (() => Date.now() / 1000);
    this.last = this.nowFn();
  }

  take(n: number): void {
    if (n <= 0) return;
    this.refill();
    if (this.tokens >= n) {
      this.tokens -= n;
    } else {
      throw new Error("Bucket empty");
    }
  }

  tryTake(n: number): boolean {
    if (n <= 0) return true;
    this.refill();
    if (this.tokens >= n) {
      this.tokens -= n;
      return true;
    }
    return false;
  }

  remaining(): number {
    this.refill();
    return Math.max(0, Math.floor(this.tokens));
  }

  private refill() {
    const now = this.nowFn();
    const delta = Math.max(0, now - this.last);
    this.tokens = Math.min(this.opts.capacity, this.tokens + delta * this.opts.refillPerSec);
    this.last = now;
  }
}