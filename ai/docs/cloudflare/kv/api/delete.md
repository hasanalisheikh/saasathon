---
title: Delete key-value pairs
description: Remove keys and their associated values from a Workers KV namespace using the delete() method.
---

# Delete key-value pairs

To delete a key-value pair, call the `delete()` method on any KV namespace bound to your Worker.

## Method Signature

```typescript
env.NAMESPACE.delete(key: string);
```

## Consistency

Similar to `put()`, `delete()` is eventually consistent. The key may still be readable for up to 60 seconds after deletion.
