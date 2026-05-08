---
title: notFound
description: API Reference for the notFound function.
url: "https://nextjs.org/docs/app/api-reference/functions/not-found"
docs_index: /docs/llms.txt
version: 16.2.6
lastUpdated: 2026-05-07
prerequisites:
  - "API Reference: /docs/app/api-reference"
  - "Functions: /docs/app/api-reference/functions"
---


> For an index of all Next.js documentation, see [/docs/llms.txt](/docs/llms.txt).
The `notFound` function allows you to render the [`not-found file`](/docs/app/api-reference/file-conventions/not-found) within a route segment as well as inject a [`<meta name="robots" content="noindex" />`](/docs/app/api-reference/file-conventions/loading#status-codes) tag for search engines.

## `notFound()`

Invoking the `notFound()` function throws a `NEXT_HTTP_ERROR_FALLBACK;404` error and terminates rendering of the route segment in which it was thrown. Specifying a [**not-found** file](/docs/app/api-reference/file-conventions/not-found) allows you to gracefully handle such errors by rendering a Not Found UI within the segment.

```jsx filename="app/user/[id]/page.js"
import { notFound } from 'next/navigation'

async function fetchUser(id) {
  const res = await fetch('https://...')
  if (!res.ok) return undefined
  return res.json()
}

export default async function Profile({ params }) {
  const { id } = await params
  const user = await fetchUser(id)

  if (!user) {
    notFound()
  }

  // ...
}
```

> **Good to know**: `notFound()` does not require you to use `return notFound()` due to using the TypeScript [`never`](https://www.typescriptlang.org/docs/handbook/2/functions.html#never) type.

## Version History

| Version   | Changes                |
| --------- | ---------------------- |
| `v13.0.0` | `notFound` introduced. |
---

For a semantic overview of all documentation, see [/docs/sitemap.md](/docs/sitemap.md)

For an index of all available documentation, see [/docs/llms.txt](/docs/llms.txt)