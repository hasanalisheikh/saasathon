---
title: productionBrowserSourceMaps
description: Enables browser source map generation during the production build.
url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/productionBrowserSourceMaps"
docs_index: /docs/llms.txt
version: 16.2.6
lastUpdated: 2026-05-07
prerequisites:
  - "Configuration: /docs/app/api-reference/config"
  - "next.config.js: /docs/app/api-reference/config/next-config-js"
---


> For an index of all Next.js documentation, see [/docs/llms.txt](/docs/llms.txt).
Source Maps are enabled by default during development. During production builds, they are disabled to prevent you leaking your source on the client, unless you specifically opt-in with the configuration flag.

Next.js provides a configuration flag you can use to enable browser source map generation during the production build:

```js filename="next.config.js"
module.exports = {
  productionBrowserSourceMaps: true,
}
```

When the `productionBrowserSourceMaps` option is enabled, the source maps will be output in the same directory as the JavaScript files. Next.js will automatically serve these files when requested.

* Adding source maps can increase `next build` time
* Increases memory usage during `next build`
---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)