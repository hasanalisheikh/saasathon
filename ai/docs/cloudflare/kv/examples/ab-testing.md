---
title: A/B testing
description: Store A/B testing configuration data in Workers KV.
---

# A/B testing

Use KV to store experiment configurations and bucket users.

```typescript
export default {
  async fetch(request, env, ctx) {
    const variant = (await env.MY_KV.get("experiment-1")) || "control";
    // Logic to serve different content based on variant
  },
};
```
