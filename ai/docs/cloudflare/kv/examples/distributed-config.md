---
title: Distributed configuration
description: Example of how to use Workers KV to build a distributed application configuration store.
---

# Distributed configuration

```typescript
export default {
  async fetch(request, env, ctx) {
    const config = await env.MY_KV.get("app-config", { type: "json" });

    if (config.maintenance_mode) {
      return new Response("Maintenance Mode", { status: 503 });
    }

    return new Response("Welcome!");
  },
};
```
