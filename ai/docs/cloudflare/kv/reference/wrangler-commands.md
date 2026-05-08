---
title: Wrangler KV commands
description: Manage Workers KV namespaces, keys, and bulk operations using Wrangler CLI commands.
---

# Wrangler KV commands

## Namespace Management

- `wrangler kv namespace create <binding_name>`
- `wrangler kv namespace list`
- `wrangler kv namespace delete --binding=<binding_name>`

## Key Management

- `wrangler kv key put --binding=<binding_name> <key> <value>`
- `wrangler kv key get --binding=<binding_name> <key>`
- `wrangler kv key list --binding=<binding_name>`
- `wrangler kv key delete --binding=<binding_name> <key>`

## Bulk Operations

- `wrangler kv bulk put --binding=<binding_name> <file>`
- `wrangler kv bulk delete --binding=<binding_name> <file>`
