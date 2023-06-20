# tenant-based-ratelimit-example

Used config

```ts
this.bind(RateLimitSecurityBindings.CONFIG).to({
  name: 'ratelimit',
  type: 'RedisStore',
  max: parseInt(process.env.RATE_LIMITER_MAX_REQS as string),
  windowMs: parseInt(process.env.RATE_LIMITER_WINDOW_MS as string),
  keyGenerator: function (req: Request) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return req.ip;
    }
    const userData = JSON.parse(atob(token?.split('.')[1] ?? ''));
    return userData.tenantId;
  },
  enabledByDefault: true,
});
```
