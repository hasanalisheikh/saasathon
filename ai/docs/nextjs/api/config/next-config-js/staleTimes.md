---
title: staleTimes
description: Learn how to override the invalidation time of the client cache.
url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/staleTimes"
docs_index: /docs/llms.txt
version: 16.2.6
lastUpdated: 2026-05-07
prerequisites:
  - "Configuration: /docs/app/api-reference/config"
  - "next.config.js: /docs/app/api-reference/config/next-config-js"
---


> For an index of all Next.js documentation, see [/docs/llms.txt](/docs/llms.txt).

> This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

`staleTimes` is an experimental feature that enables caching of page segments in the [Client Cache](/docs/app/glossary#client-cache).

You can enable this experimental feature and provide custom revalidation times by setting the experimental `staleTimes` flag:

```js filename="next.config.js"
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
}

module.exports = nextConfig
```

The `static` and `dynamic` properties correspond with the time period (in seconds) based on different types of [link prefetching](/docs/app/api-reference/components/link#prefetch).

* The `dynamic` property is used when the page is neither statically generated nor fully prefetched (e.g. with `prefetch={true}`).
  * Default: 0 seconds (not cached)
* The `static` property is used for statically generated pages, or when the `prefetch` prop on `Link` is set to `true`, or when calling [`router.prefetch`](/docs/app/api-reference/functions/use-router).
  * Default: 5 minutes

> **Good to know:**
>
> * [Loading boundaries](/docs/app/api-reference/file-conventions/loading) are considered reusable for the `static` period defined in this configuration.
> * This doesn't affect [partial rendering](/docs/app/getting-started/linking-and-navigating#client-side-transitions), **meaning shared layouts won't automatically be refetched on every navigation, only the page segment that changes.**
> * This doesn't change [back/forward caching](/docs/app/glossary#client-cache) behavior to prevent layout shift and to prevent losing the browser scroll position.

### Version History

| Version   | Changes                                                    |
| --------- | ---------------------------------------------------------- |
| `v15.0.0` | The `dynamic` `staleTimes` default changed from 30s to 0s. |
| `v14.2.0` | Experimental `staleTimes` introduced.                      |
---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)