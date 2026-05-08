---
title: "staticGeneration*"
description: Learn how to configure static generation in your Next.js application.
url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/staticGeneration"
docs_index: /docs/llms.txt
version: 16.2.6
lastUpdated: 2026-05-07
prerequisites:
  - "Configuration: /docs/app/api-reference/config"
  - "next.config.js: /docs/app/api-reference/config/next-config-js"
---


> For an index of all Next.js documentation, see [/docs/llms.txt](/docs/llms.txt).

> This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

The `staticGeneration*` options allow you to configure the Static Generation process for advanced use cases.

```ts filename="next.config.ts" switcher
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    staticGenerationRetryCount: 1,
    staticGenerationMaxConcurrency: 8,
    staticGenerationMinPagesPerWorker: 25,
  },
}

export default nextConfig
```

```js filename="next.config.js" switcher
const nextConfig = {
  experimental: {
    staticGenerationRetryCount: 1,
    staticGenerationMaxConcurrency: 8,
    staticGenerationMinPagesPerWorker: 25,
  },
}

export default nextConfig
```

## Config Options

The following options are available:

* `staticGenerationRetryCount`: The number of times to retry a failed page generation before failing the build.
* `staticGenerationMaxConcurrency`: The maximum number of pages to be processed per worker.
* `staticGenerationMinPagesPerWorker`: The minimum number of pages to be processed before starting a new worker.
---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)