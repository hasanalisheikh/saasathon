# KV

Global, low-latency, key-value data storage

> Links below point to local Markdown versions of each page.

## Overview

- [Cloudflare Workers KV](./index.md): Workers KV is a global, low-latency, key-value data store for building dynamic and performant APIs and websites.

## Getting started

- [Getting started](./getting-started/index.md): Create a KV namespace, write key-value pairs, and read data from Workers KV using Wrangler or the dashboard.

## Examples

- [Examples](./examples/index.md): Code examples demonstrating common Workers KV use cases and patterns.
- [Cache data with Workers KV](./examples/cache-data.md): Example of how to use Workers KV to cache data.
- [Build a distributed configuration store](./examples/distributed-config.md): Example of how to use Workers KV to build a distributed configuration store.
- [A/B testing with Workers KV](./examples/ab-testing.md): Store A/B testing configuration data in Workers KV.
- [Route requests across various web servers](./examples/routing.md): Example of how to use Workers KV to build a distributed routing table.
- [Store and retrieve static assets](./examples/static-assets.md): Example of how to use Workers KV to store and serve static assets.

## Tutorials

- [Tutorials](./tutorials/index.md): Step-by-step tutorials to help you build applications with Workers KV.

## Demos and architectures

- [Demos and architectures](./demos/index.md): Explore demo applications and reference architectures that use Workers KV.


## API Reference

- [KV REST API](./api/rest.md): Access Workers KV namespaces and key-value pairs programmatically using the REST API.
- [Delete key-value pairs](./api/delete.md): Remove keys and their associated values using the delete() method.
- [List keys](./api/list.md): Enumerate all keys in a Workers KV namespace using the list() method.
- [Read key-value pairs](./api/read.md): Retrieve values from a Workers KV namespace using the get() method.
- [Write key-value pairs](./api/write.md): Store data in a Workers KV namespace using the put() method.

## Concepts

- [How KV works](./concepts/how-it-works.md): Workers KV stores data centrally and caches it globally.
- [KV bindings](./concepts/bindings.md): KV bindings connect a Cloudflare Worker to a KV namespace.
- [KV namespaces](./concepts/namespaces.md): A KV namespace is a key-value database replicated globally.

## Observability

- [Metrics and analytics](./observability/metrics.md): Query Workers KV operations and storage metrics via the dashboard.

## Platform

- [Event subscriptions](./platform/event-subscriptions.md): Subscribe to Workers KV change events and process them with Cloudflare Queues.
- [Limits](./platform/limits.md): Workers KV account and namespace limits.
- [Choose a data or storage product](./platform/storage-options.md): Compare Workers KV with other Cloudflare storage products.

## Reference

- [Data security](./reference/security.md): Workers KV encryption and compliance certifications.
- [Environments](./reference/environments.md): Bind different Workers KV namespaces to the same Worker across environments.
- [Wrangler KV commands](./reference/wrangler-commands.md): Manage Workers KV using Wrangler CLI commands.