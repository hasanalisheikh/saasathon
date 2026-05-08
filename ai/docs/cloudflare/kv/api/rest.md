---
title: KV REST API
description: Access Workers KV namespaces and key-value pairs programmatically using the REST API.
---

# KV REST API

The Workers KV REST API allows you to manage namespaces and key-value pairs from external applications.

## Endpoints

- **List Namespaces**: `GET accounts/:account_identifier/storage/kv/namespaces`
- **Write Key**: `PUT accounts/:account_identifier/storage/kv/namespaces/:namespace_identifier/values/:key_name`
- **Read Key**: `GET accounts/:account_identifier/storage/kv/namespaces/:namespace_identifier/values/:key_name`
- **Delete Key**: `DELETE accounts/:account_identifier/storage/kv/namespaces/:namespace_identifier/values/:key_name`
- **List Keys**: `GET accounts/:account_identifier/storage/kv/namespaces/:namespace_identifier/keys`

## Authentication

Requires Cloudflare API credentials (Email and API Key or API Token).
