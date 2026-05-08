---
title: List keys
description: Enumerate all keys in a Workers KV namespace using the list() method, with support for pagination and filtering by prefix.
---

# List keys

To list keys in a KV namespace, call the `list()` method.

## Method Signature

```typescript
env.NAMESPACE.list(options?: {
  prefix?: string;
  limit?: number;
  cursor?: string;
});
```

## Parameters

- `prefix`: Filter keys by a specific prefix.
- `limit`: Maximum number of keys to return (default 1000, max 1000).
- `cursor`: A string used for pagination.

## Response

Returns a promise resolving to an object:

```typescript
{
  keys: [{ name: string, expiration?: number, metadata?: any }],
  list_complete: boolean,
  cursor?: string
}
```
