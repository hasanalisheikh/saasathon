---
title: Write key-value pairs
description: Store data in a Workers KV namespace using the put() method, with options for expiration and metadata.
---

# Write key-value pairs

To create or update a key-value pair, call the `put()` method on any KV namespace bound to your Worker.

## Method Signature

```typescript
env.NAMESPACE.put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: {
  expiration?: number;
  expirationTtl?: number;
  metadata?: any;
});
```

## Options

- `expiration`: The time, in seconds since the Unix epoch, at which the key should expire.
- `expirationTtl`: The number of seconds from now at which the key should expire.
- `metadata`: A serializable object to associate with the key.

## Consistency

KV is eventually consistent. Changes may take up to 60 seconds to propagate globally.
