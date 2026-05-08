---
title: Static assets
description: Example of how to use Workers KV to store and serve static assets.
---

# Static assets

```typescript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const asset = await env.MY_KV.get(`asset:${url.pathname}`, { type: "arrayBuffer" });

    if (asset) {
      return new Response(asset, {
        headers: { "Content-Type": "image/png" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
```
