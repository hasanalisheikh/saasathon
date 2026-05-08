---
title: Route Segment Config
description: Learn about how to configure options for Next.js route segments.
url: "https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config"
docs_index: /docs/llms.txt
version: 16.2.6
lastUpdated: 2026-05-07
prerequisites:
  - "API Reference: /docs/app/api-reference"
  - "File-system conventions: /docs/app/api-reference/file-conventions"
---


> For an index of all Next.js documentation, see [/docs/llms.txt](/docs/llms.txt).
The Route Segment Config options allow you to configure the behavior of a [Page](/docs/app/api-reference/file-conventions/page), [Layout](/docs/app/api-reference/file-conventions/layout), or [Route Handler](/docs/app/api-reference/file-conventions/route) by directly exporting the following variables:

| Option                                                                                             | Type                                                 | Default                    |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------- |
| [`dynamicParams`](/docs/app/api-reference/file-conventions/route-segment-config/dynamicParams)     | `boolean`                                            | `true`                     |
| [`runtime`](/docs/app/api-reference/file-conventions/route-segment-config/runtime)                 | `'nodejs' \| 'edge'`                                 | `'nodejs'`                 |
| [`preferredRegion`](/docs/app/api-reference/file-conventions/route-segment-config/preferredRegion) | `'auto' \| 'global' \| 'home' \| string \| string[]` | `'auto'`                   |
| [`maxDuration`](/docs/app/api-reference/file-conventions/route-segment-config/maxDuration)         | `number`                                             | Set by deployment platform |

## Version History

| Version      |                                                                                                                                                                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `v16.0.0`    | `dynamic`, `dynamicParams`, `revalidate`, and `fetchCache` removed when [Cache Components](/docs/app/api-reference/config/next-config-js/cacheComponents) is enabled. See [Caching and Revalidating (Previous Model)](/docs/app/guides/caching-without-cache-components#route-segment-config). |
| `v16.0.0`    | `export const experimental_ppr = true` removed. A [codemod](/docs/app/guides/upgrading/codemods#remove-experimental_ppr-route-segment-config-from-app-router-pages-and-layouts) is available.                                                                                                  |
| `v15.0.0-RC` | `export const runtime = "experimental-edge"` deprecated. A [codemod](/docs/app/guides/upgrading/codemods#transform-app-router-route-segment-config-runtime-value-from-experimental-edge-to-edge) is available.                                                                                 |

- [dynamicParams](/docs/app/api-reference/file-conventions/route-segment-config/dynamicParams)
  - API reference for the dynamicParams route segment config option.
- [maxDuration](/docs/app/api-reference/file-conventions/route-segment-config/maxDuration)
  - API reference for the maxDuration route segment config option.
- [preferredRegion](/docs/app/api-reference/file-conventions/route-segment-config/preferredRegion)
  - API reference for the preferredRegion route segment config option.
- [runtime](/docs/app/api-reference/file-conventions/route-segment-config/runtime)
  - API reference for the runtime route segment config option.

---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)