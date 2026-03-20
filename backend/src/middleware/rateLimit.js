const buckets = new Map();

const nowMs = () => Date.now();

const defaultKeyGenerator = (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown';

export const createRateLimiter = ({
  windowMs,
  max,
  keyGenerator = defaultKeyGenerator,
  message = 'Too many requests. Please try again later.',
}) => {
  const effectiveWindow = Number(windowMs) || 60_000;
  const effectiveMax = Number(max) || 5;

  return (req, res, next) => {
    const key = String(keyGenerator(req));
    const fullKey = `${req.baseUrl || ''}${req.path || ''}:${key}`;

    const existing = buckets.get(fullKey);
    const currentTime = nowMs();

    if (!existing || existing.resetAt <= currentTime) {
      buckets.set(fullKey, {
        count: 1,
        resetAt: currentTime + effectiveWindow,
      });
      return next();
    }

    existing.count += 1;

    if (existing.count > effectiveMax) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1000));
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        message,
        retryAfterSeconds,
      });
    }

    return next();
  };
};
