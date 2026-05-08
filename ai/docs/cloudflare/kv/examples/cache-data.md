---
title: Cache data with Workers KV
description: Example of how to use Workers KV to cache data and improve application performance.
---

# Cache data with Workers KV

```typescript
export default {
  async fetch(request, env, ctx) {
    const cacheKey = request.url;
    let cachedResponse = await env.MY_KV.get(cacheKey);

    if (cachedResponse) {
      return new Response(cachedResponse);
    }

    const response = await fetch(request);
    const body = await response.text();
    ctx.waitUntil(env.MY_KV.put(cacheKey, body, { expirationTtl: 3600 }));

    return new Response(body);
  },
};
```
