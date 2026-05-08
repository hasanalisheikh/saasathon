---
title: Routing
description: Example of how to use Workers KV to build a distributed routing table.
---

# Routing

```typescript
export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    const target = await env.MY_KV.get(`route:${path}`);

    if (target) {
      return Response.redirect(target, 302);
    }

    return fetch(request);
  },
};
```
