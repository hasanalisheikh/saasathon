---
title: Read key-value pairs
description: Retrieve values from a Workers KV namespace using the get() method, with support for types, caching, and metadata.
---

# Read key-value pairs

To get the value for a given key, call the `get()` method of the [KV binding](https://developers.cloudflare.com/kv/concepts/kv-bindings/) on any [KV namespace](https://developers.cloudflare.com/kv/concepts/kv-namespaces/) you have bound to your Worker code.

## Method Signatures

### Request a single key

```typescript
env.NAMESPACE.get(key: string, type?: "text" | "json" | "arrayBuffer" | "stream");
// OR
env.NAMESPACE.get(key: string, options?: { cacheTtl?: number, type?: "text" | "json" | "arrayBuffer" | "stream" });
```

### Request multiple keys

```typescript
env.NAMESPACE.get(keys: string[], type?: "text" | "json");
// OR
env.NAMESPACE.get(keys: string[], options?: { cacheTtl?: number, type?: "text" | "json" });
```

### Request with Metadata

```typescript
env.NAMESPACE.getWithMetadata(key: string, type?: "text" | "json" | "arrayBuffer" | "stream");
```

## Types

- `text`: A `string` (default).
- `json`: An object decoded from a JSON string.
- `arrayBuffer`: An `ArrayBuffer` instance.
- `stream`: A `ReadableStream`.

## Cache TTL

`cacheTtl` defines the length of time in seconds that a KV result is cached (minimum: 30).
