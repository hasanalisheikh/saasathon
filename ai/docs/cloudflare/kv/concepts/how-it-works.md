---
title: How KV works
description: Workers KV stores data centrally and caches it globally, optimizing for high-read, low-latency workloads.
---

# How KV works

Workers KV is a key-value store that is optimized for high-read, low-latency workloads.

## Architecture

- **Centralized Storage**: All data is stored in a central location.
- **Global Caching**: Data is cached in Cloudflare's global network locations (edge).
- **Eventual Consistency**: Changes to KV are propagated to all global locations within 60 seconds.

## Consistency Model

KV is eventually consistent. This means that after a write, there may be a short period where different users see different values depending on their global location.
