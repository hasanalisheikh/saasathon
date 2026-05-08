---
title: Getting started
description: Create a KV namespace, write key-value pairs, and read data from Workers KV using Wrangler or the dashboard.
---

# Getting started

Create a basic key-value store which stores the notification configuration of all users in an application, where each user may have `enabled` or `disabled` notifications.

Workers KV provides low-latency, high-throughput global storage to your [Cloudflare Workers](https://developers.cloudflare.com/workers/) applications.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [Node.js](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

## 1. Create a Worker project

```bash
npm create cloudflare@latest -- kv-tutorial
```

## 2. Create a KV namespace

```bash
npx wrangler kv namespace create USERS_NOTIFICATION_CONFIG
```

## 3. Bind your Worker to your KV namespace

In your `wrangler.jsonc` (or `wrangler.toml`), add the binding:

```json
{
  "kv_namespaces": [
    {
      "binding": "USERS_NOTIFICATION_CONFIG",
      "id": "<BINDING_ID>"
    }
  ]
}
```

## 4. Interact with your KV namespace

### Write a value

```bash
npx wrangler kv key put --binding=USERS_NOTIFICATION_CONFIG "user_1" "enabled"
```

### Read a value in a Worker

```typescript
export default {
  async fetch(request, env, ctx): Promise<Response> {
    await env.USERS_NOTIFICATION_CONFIG.put("user_2", "disabled");
    const value = await env.USERS_NOTIFICATION_CONFIG.get("user_2");
    return new Response(value);
  },
} satisfies ExportedHandler<Env>;
```

## 5. Deploy your Worker

```bash
npm run deploy
```
