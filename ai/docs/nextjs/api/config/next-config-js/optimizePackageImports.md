---
title: optimizePackageImports
description: API Reference for optimizePackageImports Next.js Config Option
url: "https://nextjs.org/docs/app/api-reference/config/next-config-js/optimizePackageImports"
docs_index: /docs/llms.txt
version: 16.2.6
lastUpdated: 2026-05-07
prerequisites:
  - "Configuration: /docs/app/api-reference/config"
  - "next.config.js: /docs/app/api-reference/config/next-config-js"
---


> For an index of all Next.js documentation, see [/docs/llms.txt](/docs/llms.txt).

> This feature is currently experimental and subject to change, it's not recommended for production. Try it out and share your feedback on [GitHub](https://github.com/vercel/next.js/issues).

Some packages can export hundreds or thousands of modules, which can cause performance issues in development and production.

Adding a package to `experimental.optimizePackageImports` will only load the modules you are actually using, while still giving you the convenience of writing import statements with many named exports.

```js filename="next.config.js"
module.exports = {
  experimental: {
    optimizePackageImports: ['package-name'],
  },
}
```

The following libraries are optimized by default:

* `lucide-react`
* `date-fns`
* `lodash-es`
* `ramda`
* `antd`
* `react-bootstrap`
* `ahooks`
* `@ant-design/icons`
* `@headlessui/react`
* `@headlessui-float/react`
* `@heroicons/react/20/solid`
* `@heroicons/react/24/solid`
* `@heroicons/react/24/outline`
* `@visx/visx`
* `@tremor/react`
* `rxjs`
* `@mui/material`
* `@mui/icons-material`
* `recharts`
* `react-use`
* `@material-ui/core`
* `@material-ui/icons`
* `@tabler/icons-react`
* `mui-core`
* `react-icons/*`
* `effect`
* `@effect/*`
---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)