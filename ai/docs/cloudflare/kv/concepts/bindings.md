---
title: KV bindings
description: KV bindings connect a Cloudflare Worker to a KV namespace for reading and writing data.
---

# KV bindings

A binding is how your Worker interacts with external resources such as KV namespaces.

## Configuration

In `wrangler.jsonc`:

```json
{
  "kv_namespaces": [
    {
      "binding": "MY_KV",
      "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
  ]
}
```

## Usage

Once bound, you can access the namespace in your Worker code via the `env` object:

```typescript
const value = await env.MY_KV.get("my-key");
```
