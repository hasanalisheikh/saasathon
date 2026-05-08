# Hono

> Hono: Small, simple, ultrafast web framework built on Web Standards. Works on Cloudflare Workers, Fastly, Deno, Bun, Vercel, Netlify, AWS, and Node.js.

## Core & Getting Started

- [Index](./index.md): Main overview.
- [Bun](./getting-started/bun.md): Bun runtime setup.
- [Node.js](./getting-started/nodejs.md): Node.js adapter setup.
- [Cloudflare Workers](./getting-started/cloudflare-workers.md): Workers deployment.
- [Next.js](./getting-started/nextjs.md): Next.js integration.
- [Supabase Functions](./getting-started/supabase-functions.md): Supabase Edge setup.
- [Service Worker](./getting-started/service-worker.md): Service Worker usage.
- [Basic](./getting-started/basic.md): Initial setup examples.
- [WebAssembly WASI](./getting-started/webassembly-wasi.md): WASI environment setup.

## API Reference

- [Hono](./api/hono.md): Core class, routing, and config.
- [Context](./api/context.md): Context object (c) details.
- [Request](./api/request.md): HonoRequest parameters and body.
- [Routing](./api/routing.md): Routing patterns and matching.
- [Exception](./api/exception.md): Error handling and HTTPException.
- [Presets](./api/presets.md): hono/tiny and minimal bundles.
- [Index](./api/index.md): API overview.

## Middleware

- [Basic Auth](./middleware/basic-auth.md): HTTP Basic authentication.
- [Bearer Auth](./middleware/bearer-auth.md): API key authentication.
- [JWT](./middleware/jwt.md): JWT auth and verification.
- [CORS](./middleware/cors.md): Cross-Origin Resource Sharing.
- [CSRF](./middleware/csrf.md): CSRF protection.
- [Logger](./middleware/logger.md): Development logging.
- [ETag](./middleware/etag.md): ETag header generation.
- [Cache](./middleware/cache.md): Content caching.
- [Compress](./middleware/compress.md): Response compression.
- [Secure Headers](./middleware/secure-headers.md): Security HTTP headers.
- [Body Limit](./middleware/body-limit.md): Request body size limits.
- [Timeout](./middleware/timeout.md): Request time limits.
- [Timing](./middleware/timing.md): Performance profiling headers.
- [Pretty JSON](./middleware/pretty-json.md): Formatted JSON output.
- [Trailing Slash](./middleware/trailing-slash.md): URL slash normalization.
- [Language](./middleware/language.md): Content negotiation.
- [IP Restriction](./middleware/ip-restriction.md): IP-based access control.
- [Method Override](./middleware/method-override.md): HTTP method tunneling.
- [Context Storage](./middleware/context-storage.md): AsyncLocalStorage access.
- [JWK](./middleware/jwk.md): JSON Web Key verification.
- [JSX Renderer](./middleware/jsx-renderer.md): Built-in JSX rendering.
- [Combine](./middleware/combine.md): Middleware composition.
- [Third Party](./middleware/third-party.md): Community middleware guide.

## Helpers

- [Cookie](./helpers/cookie.md): Cookie management.
- [JWT](./helpers/jwt.md): Low-level JWT utilities.
- [HTML](./helpers/html.md): HTML templates and sanitization.
- [Streaming](./helpers/streaming.md): SSE and direct streams.
- [Websocket](./helpers/websocket.md): WebSocket support.
- [SSG](./helpers/ssg.md): Static site generation.
- [Factory](./helpers/factory.md): Typed middleware creation.
- [Dev](./helpers/dev.md): Debugging tools.
- [Testing](./helpers/testing.md): Test utilities.
- [Proxy](./helpers/proxy.md): Request proxying.
- [CSS](./helpers/css.md): CSS-in-JS support.
- [Adapter](./helpers/adapter.md): Runtime environment access.
- [Conninfo](./helpers/conninfo.md): Client connection details.
- [Route](./helpers/route.md): Route management utilities.
- [Accepts](./helpers/accepts.md): Header negotiation.

## Guides

- [Middleware](./guides/middleware.md): Custom middleware guide.
- [RPC](./guides/rpc.md): Type-safe client/server mode.
- [Validation](./guides/validation.md): Zod and data validation.
- [JSX](./guides/jsx.md): Server-side JSX guide.
- [JSX DOM](./guides/jsx-dom.md): Client-side JSX usage.
- [Testing](./guides/testing.md): Testing best practices.
- [Helpers](./guides/helpers.md): Helper overview.
- [Create Hono](./guides/create-hono.md): CLI usage.
- [Best Practices](./guides/best-practices.md): Recommended patterns.
- [FAQ](./guides/faq.md): Common questions.
- [Examples](./guides/examples.md): Code snippets.
- [Others](./guides/others.md): Integration guides.

## Concepts

- [Middleware](./concepts/middleware.md): Middleware architecture.
- [Developer Experience](./concepts/developer-experience.md): Design philosophy.
- [Routers](./concepts/routers.md): Router engine details.
- [Stacks](./concepts/stacks.md): Integration patterns.
- [Web Standard](./concepts/web-standard.md): Web Standard usage.
