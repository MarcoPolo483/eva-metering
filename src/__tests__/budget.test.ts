import { describe, it, expect } from "vitest";
import { TokenBucket } from "../budget/tokenBucket.js";
import { RollingWindowQuota } from "../budget/rollingWindow.js";

describe("Budgets and quotas", () => {
  it("token bucket take/tryTake/remaining", () => {
    let t = 0;
    const now = () => t;
    const b = new TokenBucket({ capacity: 10, refillPerSec: 1, now });
    b.take(5);
    expect(b.remaining()).toBe(5);
    t += 3; // refill 3
    expect(b.tryTake(7)).toBe(true); // 5+3 >= 7
    expect(b.tryTake(10)).toBe(false);
  });

  it("rolling window quota allows up to limit per window", () => {
    let t = 0;
    const now = () => t;
    const q = new RollingWindowQuota({ windowMs: 1000, limit: 2, now });
    expect(q.hit("a")).toBe(true);
    expect(q.hit("a")).toBe(true);
    expect(q.hit("a")).toBe(false);
    t = 1500;
    expect(q.hit("a")).toBe(true);
    expect(q.count("a")).toBe(1);
  });
});