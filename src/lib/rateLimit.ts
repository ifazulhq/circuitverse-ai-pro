type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

/** Sweep expired entries at most once per minute to prevent unbounded map growth. */
const SWEEP_INTERVAL_MS = 60_000;
let lastSweepAt = 0;

function sweepExpiredEntries(now: number): void {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
  for (const [key, entry] of rateLimitStore) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();

  // Passive TTL sweep — runs at most once per minute
  sweepExpiredEntries(now);

  const existingEntry = rateLimitStore.get(key);

  if (!existingEntry || now >= existingEntry.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  if (existingEntry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: existingEntry.resetAt,
    };
  }

  existingEntry.count += 1;

  rateLimitStore.set(key, existingEntry);

  return {
    success: true,
    remaining: limit - existingEntry.count,
    resetAt: existingEntry.resetAt,
  };
}