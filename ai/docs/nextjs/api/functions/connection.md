---
title: connection
description: API Reference for the connection function.
url: "https://nextjs.org/docs/app/api-reference/functions/connection"
docs_index: /docs/llms.txt
version: 16.2.6
lastUpdated: 2026-05-07
prerequisites:
  - "API Reference: /docs/app/api-reference"
  - "Functions: /docs/app/api-reference/functions"
---


> For an index of all Next.js documentation, see [/docs/llms.txt](/docs/llms.txt).
The `connection()` function allows you to indicate rendering should wait for an incoming user request before continuing.

It's useful when a component doesn't use [Request-time APIs](/docs/app/glossary#request-time-apis), but you want it to be rendered at runtime and not prerendered at build time. This usually occurs when you access external information that you intentionally want to change the result of a render, such as `Math.random()` or `new Date()`.

```ts filename="app/page.tsx" switcher
import { connection } from 'next/server'

export default async function Page() {
  await connection()
  // Everything below will be excluded from prerendering
  const rand = Math.random()
  return <span>{rand}</span>
}
```

```jsx filename="app/page.js" switcher
import { connection } from 'next/server'

export default async function Page() {
  await connection()
  // Everything below will be excluded from prerendering
  const rand = Math.random()
  return <span>{rand}</span>
}
```

## Reference

### Type

```jsx
function connection(): Promise<void>
```

### Parameters

* The function does not accept any parameters.

### Returns

* The function returns a `void` Promise. It is not meant to be consumed.

## Good to know

* `connection` replaces [`unstable_noStore`](/docs/app/api-reference/functions/unstable_noStore) to better align with the future of Next.js.
* The function is only necessary when dynamic rendering is required and common Request-time APIs are not used.

### Version History

| Version      | Changes                  |
| ------------ | ------------------------ |
| `v15.0.0`    | `connection` stabilized. |
| `v15.0.0-RC` | `connection` introduced. |
---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)