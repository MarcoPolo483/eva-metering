import { describe, it, expect } from "vitest";
import { TokenBucket } from "../budget/tokenBucket.js";
import { RollingWindowQuota } from "../budget/rollingWindow.js";

describe("Budget and quota error paths and edge cases", () => {
  it("TokenBucket rejects invalid options", () => {
    expect(() => new TokenBucket({ capacity: 0, refillPerSec: 1 })).toThrow(/Invalid bucket/);
    expect(() => new TokenBucket({ capacity: 10, refillPerSec: -1 })).toThrow(/Invalid bucket/);
  });

  it("TokenBucket take with non-positive n is a no-op and tryTake(0) is true", () => {
    let t = 0;
    const b = new TokenBucket({ capacity: 5, refillPerSec: 0, now: () => t });
    const before = b.remaining();
    b.take(0);
    expect(b.remaining()).toBe(before);
    expect(b.tryTake(0)).toBe(true);
  });

  it("RollingWindowQuota rejects invalid options", () => {
    expect(() => new RollingWindowQuota({ windowMs: 0, limit: 1 })).toThrow(/Invalid quota/);
    expect(() => new RollingWindowQuota({ windowMs: 1000, limit: 0 })).toThrow(/Invalid quota/);
  });
});