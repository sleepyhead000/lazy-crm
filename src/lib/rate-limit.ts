interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, retryAfterMs: 0 };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfterMs = entry.resetAt - now;
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, retryAfterMs: 0 };
}

const failedLoginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function checkLoginLockout(
  identifier: string,
  maxAttempts: number,
  lockoutDurationMs: number
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = failedLoginAttempts.get(identifier);

  if (!entry || now > entry.lockedUntil) {
    if (entry && now > entry.lockedUntil) {
      failedLoginAttempts.delete(identifier);
    }
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    const retryAfterMs = entry.lockedUntil - now;
    return { allowed: false, retryAfterMs };
  }

  return { allowed: true, retryAfterMs: 0 };
}

export function recordFailedLogin(identifier: string, lockoutDurationMs: number): void {
  const now = Date.now();
  const entry = failedLoginAttempts.get(identifier);

  if (!entry || now > entry.lockedUntil) {
    failedLoginAttempts.set(identifier, { count: 1, lockedUntil: now + lockoutDurationMs });
    return;
  }

  entry.count++;
}

export function clearFailedLogins(identifier: string): void {
  failedLoginAttempts.delete(identifier);
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
  for (const [key, entry] of failedLoginAttempts) {
    if (now > entry.lockedUntil) failedLoginAttempts.delete(key);
  }
}, 60_000);
