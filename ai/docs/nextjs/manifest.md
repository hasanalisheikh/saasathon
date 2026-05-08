# Next.js Documentation

> Reference and guides for Next.js 16.2.6 — the React framework for building full-stack web applications. Sections cover Getting Started, App Router, Architecture, and Community Resources.

@doc-version: 16.2.6
@doc-version-notes: Some features may have extended or refined behavior in minor or patch releases


## Getting Started

Learn how to create full-stack web applications with the Next.js App Router.

- [Installation](./getting-started/installation.md): Learn how to create a new Next.js application with the `create-next-app` CLI, and set up TypeScript, ESLint, and Module Path Aliases.
- [Project Structure](./getting-started/project-structure.md): Learn the folder and file conventions in Next.js, and how to organize your project.
- [Layouts and Pages](./getting-started/layouts-and-pages.md): Learn how to create your first pages and layouts, and link between them with the Link component.
- [Linking and Navigating](./getting-started/linking-and-navigating.md): Learn how the built-in navigation optimizations work, including prefetching, prerendering, and client-side navigation, and how to optimize navigation for dynamic routes and slow networks.
- [Server and Client Components](./getting-started/server-and-client-components.md): Learn how you can use React Server and Client Components to render parts of your application on the server or the client.
- [Fetching Data](./getting-started/fetching-data.md): Learn how to fetch data and stream content that depends on data.
- [Mutating Data](./getting-started/mutating-data.md): Learn how to mutate data using Server Functions and Server Actions in Next.js.
- [Caching](./getting-started/caching.md): Learn how to cache data and UI in Next.js
- [Revalidating](./getting-started/revalidating.md): Learn how to revalidate cached data using time-based and on-demand strategies.
- [Error Handling](./getting-started/error-handling.md): Learn how to display expected errors and handle uncaught exceptions.
- [CSS](./getting-started/css.md): Learn about the different ways to add CSS to your application, including Tailwind CSS, CSS Modules, Global CSS, and more.
- [Image Optimization](./getting-started/images.md): Learn how to optimize images in Next.js
- [Font Optimization](./getting-started/fonts.md): Learn how to optimize fonts in Next.js
- [Metadata and OG images](./getting-started/metadata-and-og-images.md): Learn how to add metadata to your pages and create dynamic OG images.
- [Route Handlers](./getting-started/route-handlers.md): Learn how to use Route Handlers
- [Proxy](./getting-started/proxy.md): Learn how to use Proxy
- [Deploying](./getting-started/deploying.md): Learn how to deploy your Next.js application.
- [Upgrading](./getting-started/upgrading.md): Learn how to upgrade your Next.js application to the latest version or canary.

## Guides

Learn how to implement common patterns and real-world use cases using Next.js

- [AI Coding Agents](./guides/ai-agents.md): Learn how to configure your Next.js project so AI coding agents use up-to-date documentation instead of outdated training data.
- [Analytics](./guides/analytics.md): Measure and track page performance using Next.js Speed Insights
- [Authentication](./guides/authentication.md): Learn how to implement authentication in your Next.js application.
- [Backend for Frontend](./guides/backend-for-frontend.md): Learn how to use Next.js as a backend framework
- [Caching (Previous Model)](./guides/caching-without-cache-components.md): Learn how to cache and revalidate data using fetch options, unstable_cache, and route segment configs for projects not using Cache Components.
- [CDN Caching](./guides/cdn-caching.md): Learn how CDN caching works with Next.js, including what works today, cache variability, and the direction toward pathname-based cache keying.
- [CI Build Caching](./guides/ci-build-caching.md): Learn how to configure CI to cache Next.js builds
- [Content Security Policy](./guides/content-security-policy.md): Learn how to set a Content Security Policy (CSP) for your Next.js application.
- [Data Security](./guides/data-security.md): Learn the built-in data security features in Next.js and learn best practices for protecting your application's data.
- [Debugging](./guides/debugging.md): Learn how to debug your Next.js application with VS Code, Chrome DevTools, or Firefox DevTools.
- [Deploying to Platforms](./guides/deploying-to-platforms.md): Understand which Next.js features require specific platform capabilities and how to choose the right deployment target.
- [Draft Mode](./guides/draft-mode.md): Next.js has draft mode to toggle between static and dynamic pages. You can learn how it works with App Router here.
- [Environment Variables](./guides/environment-variables.md): Learn to add and access environment variables in your Next.js application.
- [Forms](./guides/forms.md): Learn how to create forms in Next.js with React Server Actions.
- [How Revalidation Works](./guides/how-revalidation-works.md): A deep dive into how Next.js revalidates cached content, including the tag system, cache consistency, and multi-instance coordination.
- [ISR](./guides/incremental-static-regeneration.md): Learn how to create or update static pages at runtime with Incremental Static Regeneration.
- [Instrumentation](./guides/instrumentation.md): Learn how to use instrumentation to run code at server startup in your Next.js app
- [Internationalization](./guides/internationalization.md): Add support for multiple languages with internationalized routing and localized content.
- [JSON-LD](./guides/json-ld.md): Learn how to add JSON-LD to your Next.js application to describe your content to search engines and AI.
- [Lazy Loading](./guides/lazy-loading.md): Lazy load imported libraries and React Components to improve your application's loading performance.
- [Development Environment](./guides/local-development.md): Learn how to optimize your local development environment with Next.js.
- [Next.js MCP Server](./guides/mcp.md): Learn how to use Next.js MCP support to allow coding agents access to your application state
- [MDX](./guides/mdx.md): Learn how to configure MDX and use it in your Next.js apps.
- [Memory Usage](./guides/memory-usage.md): Optimize memory used by your application in development and production.
- [Migrating](./guides/migrating.md): Learn how to migrate from popular frameworks to Next.js
  - [App Router](./guides/migrating/app-router-migration.md): Learn how to upgrade your existing Next.js application from the Pages Router to the App Router.
- [Migrating to Cache Components](./guides/migrating-to-cache-components.md): Learn how to migrate from route segment configs to Cache Components in Next.js.
- [Multi-tenant](./guides/multi-tenant.md): Learn how to build multi-tenant apps with the App Router.
- [OpenTelemetry](./guides/open-telemetry.md): Learn how to instrument your Next.js app with OpenTelemetry.
- [Package Bundling](./guides/package-bundling.md): Learn how to analyze and optimize your application's server and client bundles with the Next.js Bundle Analyzer for Turbopack, and the `@next/bundle-analyzer` plugin for Webpack.
- [PPR Platform Guide](./guides/ppr-platform-guide.md): A guide for platform engineers on implementing PPR support, from basic origin rendering to optimized CDN integration.
- [Prefetching](./guides/prefetching.md): Learn how to configure prefetching in Next.js
- [Preserving UI state](./guides/preserving-ui-state.md): Learn how to control which UI state is preserved and which resets when navigating between pages.
- [Production](./guides/production-checklist.md): Recommendations to ensure the best performance and user experience before taking your Next.js application to production.
- [Public pages](./guides/public-static-pages.md): Learn how to build public, "static" pages that share data across users, such as landing pages, list pages (products, blogs, etc.), marketing and news sites.
- [Redirecting](./guides/redirecting.md): Learn the different ways to handle redirects in Next.js.
- [Rendering Philosophy](./guides/rendering-philosophy.md): Learn how Next.js treats static and dynamic rendering as a spectrum at the component level, and what this means for deployment.
- [Scripts](./guides/scripts.md): Optimize 3rd party scripts with the built-in Script component.
- [SPAs](./guides/single-page-applications.md): Next.js fully supports building Single-Page Applications (SPAs).
- [Streaming](./guides/streaming.md): Learn how streaming works in Next.js and how to use it to progressively render UI as data becomes available.
- [Testing](./guides/testing.md): Learn how to set up Next.js with four commonly used testing tools — Cypress, Playwright, Vitest, and Jest.
  - [Cypress](./guides/testing/cypress.md): Learn how to set up Cypress with Next.js for End-to-End (E2E) and Component Testing.
  - [Jest](./guides/testing/jest.md): Learn how to set up Jest with Next.js for Unit Testing and Snapshot Testing.
  - [Playwright](./guides/testing/playwright.md): Learn how to set up Playwright with Next.js for End-to-End (E2E) Testing.
  - [Vitest](./guides/testing/vitest.md): Learn how to set up Vitest with Next.js for Unit Testing.
- [Third Party Libraries](./guides/third-party-libraries.md): Optimize the performance of third-party libraries in your application with the `@next/third-parties` package.
- [Upgrading](./guides/upgrading.md): Learn how to upgrade to the latest versions of Next.js.
  - [Codemods](./guides/upgrading/codemods.md): Use codemods to upgrade your Next.js codebase when new features are released.
  - [Version 16](./guides/upgrading/version-16.md): Upgrade your Next.js Application from Version 15 to 16.
- [Videos](./guides/videos.md): Recommendations and best practices for optimizing videos in your Next.js application.
- [View transitions](./guides/view-transitions.md): Learn how to use view transitions to communicate meaning during navigation, loading, and content changes in a Next.js app.

## API Reference

Next.js API Reference for the App Router.

- [Directives](./api/directives.md): Directives are used to modify the behavior of your Next.js application.
  - [use cache](./api/directives/use-cache.md): Learn how to use the "use cache" directive to cache data in your Next.js application.
  - [use cache: private](./api/directives/use-cache-private.md): Learn how to use the "use cache: private" directive to cache functions that access runtime request APIs.
  - [use cache: remote](./api/directives/use-cache-remote.md): Learn how to use the "use cache: remote" directive for persistent, shared caching using remote cache handlers.
  - [use client](./api/directives/use-client.md): Learn how to use the use client directive to render a component on the client.
  - [use server](./api/directives/use-server.md): Learn how to use the use server directive to execute code on the server.
- [Components](./api/components.md): API Reference for Next.js built-in components.
  - [Font](./api/components/font.md): Optimizing loading web fonts with the built-in `next/font` loaders.
  - [Form Component](./api/components/form.md): Learn how to use the `<Form>` component to handle form submissions and search params updates with client-side navigation.
  - [Image Component](./api/components/image.md): Optimize Images in your Next.js Application using the built-in `next/image` Component.
  - [Link Component](./api/components/link.md): Enable fast client-side navigation with the built-in `next/link` component.
  - [Script Component](./api/components/script.md): Optimize third-party scripts in your Next.js application using the built-in `next/script` Component.
- [File-system conventions](./api/file-conventions.md): API Reference for Next.js file-system conventions.
  - [default.js](./api/file-conventions/default.md): API Reference for the default.js file.
  - [Dynamic Segments](./api/file-conventions/dynamic-routes.md): Dynamic Route Segments can be used to programmatically generate route segments from dynamic data.
  - [error.js](./api/file-conventions/error.md): API reference for the error.js special file.
  - [forbidden.js](./api/file-conventions/forbidden.md): API reference for the forbidden.js special file.
  - [instrumentation.js](./api/file-conventions/instrumentation.md): API reference for the instrumentation.js file.
  - [instrumentation-client.js](./api/file-conventions/instrumentation-client.md): Learn how to add client-side instrumentation to track and monitor your Next.js application's frontend performance.
  - [Intercepting Routes](./api/file-conventions/intercepting-routes.md): Use intercepting routes to load a new route within the current layout while masking the browser URL, useful for advanced routing patterns such as modals.
  - [layout.js](./api/file-conventions/layout.md): API reference for the layout.js file.
  - [loading.js](./api/file-conventions/loading.md): API reference for the loading.js file.
  - [mdx-components.js](./api/file-conventions/mdx-components.md): API reference for the mdx-components.js file.
  - [not-found.js](./api/file-conventions/not-found.md): API reference for the not-found.js file.
  - [page.js](./api/file-conventions/page.md): API reference for the page.js file.
  - [Parallel Routes](./api/file-conventions/parallel-routes.md): Simultaneously render one or more pages in the same view that can be navigated independently. A pattern for highly dynamic applications.
  - [proxy.js](./api/file-conventions/proxy.md): API reference for the proxy.js file.
  - [public](./api/file-conventions/public-folder.md): Next.js allows you to serve static files, like images, in the public directory. You can learn how it works here.
  - [route.js](./api/file-conventions/route.md): API reference for the route.js special file.
    - [dynamicParams](./api/file-conventions/route-segment-config/dynamicParams.md): API reference for the dynamicParams route segment config option.
    - [maxDuration](./api/file-conventions/route-segment-config/maxDuration.md): API reference for the maxDuration route segment config option.
    - [preferredRegion](./api/file-conventions/route-segment-config/preferredRegion.md): API reference for the preferredRegion route segment config option.
    - [runtime](./api/file-conventions/route-segment-config/runtime.md): API reference for the runtime route segment config option.
  - [Route Groups](./api/file-conventions/route-groups.md): Route Groups can be used to partition your Next.js application into different sections.
  - [src](./api/file-conventions/src-folder.md): Save pages under the `src` folder as an alternative to the root `pages` directory.
  - [template.js](./api/file-conventions/template.md): API Reference for the template.js file.
  - [unauthorized.js](./api/file-conventions/unauthorized.md): API reference for the unauthorized.js special file.
  - [Metadata Files](./api/file-conventions/metadata.md): API documentation for the metadata file conventions.
    - [favicon, icon, and apple-icon](./api/file-conventions/metadata/app-icons.md): API Reference for the Favicon, Icon and Apple Icon file conventions.
    - [manifest.json](./api/file-conventions/metadata/manifest.md): API Reference for manifest.json file.
    - [opengraph-image and twitter-image](./api/file-conventions/metadata/opengraph-image.md): API Reference for the Open Graph Image and Twitter Image file conventions.
    - [robots.txt](./api/file-conventions/metadata/robots.md): API Reference for robots.txt file.
    - [sitemap.xml](./api/file-conventions/metadata/sitemap.md): API Reference for the sitemap.xml file.
  - [Route Segment Config](./api/file-conventions/route-segment-config.md): Learn about how to configure options for Next.js route segments.
    - [dynamicParams](./api/file-conventions/route-segment-config/dynamicParams.md): API reference for the dynamicParams route segment config option.
    - [maxDuration](./api/file-conventions/route-segment-config/maxDuration.md): API reference for the maxDuration route segment config option.
    - [preferredRegion](./api/file-conventions/route-segment-config/preferredRegion.md): API reference for the preferredRegion route segment config option.
    - [runtime](./api/file-conventions/route-segment-config/runtime.md): API reference for the runtime route segment config option.
- [Functions](./api/functions.md): API Reference for Next.js Functions and Hooks.
  - [after](./api/functions/after.md): API Reference for the after function.
  - [cacheLife](./api/functions/cacheLife.md): Learn how to use the cacheLife function to set the cache expiration time for a cached function or component.
  - [cacheTag](./api/functions/cacheTag.md): Learn how to use the cacheTag function to manage cache invalidation in your Next.js application.
  - [unstable_catchError](./api/functions/catchError.md): API Reference for the unstable_catchError function.
  - [connection](./api/functions/connection.md): API Reference for the connection function.
  - [cookies](./api/functions/cookies.md): API Reference for the cookies function.
  - [draftMode](./api/functions/draft-mode.md): API Reference for the draftMode function.
  - [fetch](./api/functions/fetch.md): API reference for the extended fetch function.
  - [forbidden](./api/functions/forbidden.md): API Reference for the forbidden function.
  - [generateImageMetadata](./api/functions/generate-image-metadata.md): Learn how to generate multiple images in a single Metadata API special file.
  - [generateMetadata](./api/functions/generate-metadata.md): Learn how to add Metadata to your Next.js application for improved search engine optimization (SEO) and web shareability.
  - [generateSitemaps](./api/functions/generate-sitemaps.md): Learn how to use the generateSiteMaps function to create multiple sitemaps for your application.
  - [generateStaticParams](./api/functions/generate-static-params.md): API reference for the generateStaticParams function.
  - [generateViewport](./api/functions/generate-viewport.md): API Reference for the generateViewport function.
  - [headers](./api/functions/headers.md): API reference for the headers function.
  - [ImageResponse](./api/functions/image-response.md): API Reference for the ImageResponse constructor.
  - [NextRequest](./api/functions/next-request.md): API Reference for NextRequest.
  - [NextResponse](./api/functions/next-response.md): API Reference for NextResponse.
  - [notFound](./api/functions/not-found.md): API Reference for the notFound function.
  - [permanentRedirect](./api/functions/permanentRedirect.md): API Reference for the permanentRedirect function.
  - [redirect](./api/functions/redirect.md): API Reference for the redirect function.
  - [refresh](./api/functions/refresh.md): API Reference for the refresh function.
  - [revalidatePath](./api/functions/revalidatePath.md): API Reference for the revalidatePath function.
  - [revalidateTag](./api/functions/revalidateTag.md): API Reference for the revalidateTag function.
  - [unauthorized](./api/functions/unauthorized.md): API Reference for the unauthorized function.
  - [unstable_cache](./api/functions/unstable_cache.md): API Reference for the unstable_cache function.
  - [unstable_noStore](./api/functions/unstable_noStore.md): API Reference for the unstable_noStore function.
  - [unstable_rethrow](./api/functions/unstable_rethrow.md): API Reference for the unstable_rethrow function.
  - [updateTag](./api/functions/updateTag.md): API Reference for the updateTag function.
  - [useLinkStatus](./api/functions/use-link-status.md): API Reference for the useLinkStatus hook.
  - [useParams](./api/functions/use-params.md): API Reference for the useParams hook.
  - [usePathname](./api/functions/use-pathname.md): API Reference for the usePathname hook.
  - [useReportWebVitals](./api/functions/use-report-web-vitals.md): API Reference for the useReportWebVitals function.
  - [useRouter](./api/functions/use-router.md): API reference for the useRouter hook.
  - [useSearchParams](./api/functions/use-search-params.md): API Reference for the useSearchParams hook.
  - [useSelectedLayoutSegment](./api/functions/use-selected-layout-segment.md): API Reference for the useSelectedLayoutSegment hook.
  - [useSelectedLayoutSegments](./api/functions/use-selected-layout-segments.md): API Reference for the useSelectedLayoutSegments hook.
  - [userAgent](./api/functions/userAgent.md): The userAgent helper extends the Web Request API with additional properties and methods to interact with the user agent object from the request.
- [Configuration](./api/config.md): Learn how to configure Next.js applications.
  - [next.config.js](./api/config/next-config-js.md): Learn how to configure your application with next.config.js.
    - [adapterPath](./api/config/next-config-js/adapterPath.md): Configure a custom adapter for Next.js to hook into the build process.
    - [allowedDevOrigins](./api/config/next-config-js/allowedDevOrigins.md): Use `allowedDevOrigins` to configure additional origins that can request the dev server.
    - [appDir](./api/config/next-config-js/appDir.md): Enable the App Router to use layouts, streaming, and more.
    - [assetPrefix](./api/config/next-config-js/assetPrefix.md): Learn how to use the assetPrefix config option to configure your CDN.
    - [authInterrupts](./api/config/next-config-js/authInterrupts.md): Learn how to enable the experimental `authInterrupts` configuration option to use `forbidden` and `unauthorized`.
    - [basePath](./api/config/next-config-js/basePath.md): Use `basePath` to deploy a Next.js application under a sub-path of a domain.
    - [cacheComponents](./api/config/next-config-js/cacheComponents.md): Learn how to enable the cacheComponents flag in Next.js.
    - [cacheHandlers](./api/config/next-config-js/cacheHandlers.md): Configure custom cache handlers for use cache directives in Next.js.
    - [cacheLife](./api/config/next-config-js/cacheLife.md): Learn how to set up cacheLife configurations in Next.js.
    - [compress](./api/config/next-config-js/compress.md): Next.js provides gzip compression to compress rendered content and static files, it only works with the server target. Learn more about it here.
    - [crossOrigin](./api/config/next-config-js/crossOrigin.md): Use the `crossOrigin` option to add a crossOrigin tag on the `script` tags generated by `next/script`.
    - [cssChunking](./api/config/next-config-js/cssChunking.md): Use the `cssChunking` option to control how CSS files are chunked in your Next.js application.
    - [deploymentId](./api/config/next-config-js/deploymentId.md): Configure a deployment identifier used for version skew protection and cache busting.
    - [devIndicators](./api/config/next-config-js/devIndicators.md): Configuration options for the on-screen indicator that gives context about the current route you're viewing during development.
    - [distDir](./api/config/next-config-js/distDir.md): Set a custom build directory to use instead of the default .next directory.
    - [env](./api/config/next-config-js/env.md): Learn to add and access environment variables in your Next.js application at build time.
    - [expireTime](./api/config/next-config-js/expireTime.md): Customize stale-while-revalidate expire time for ISR enabled pages.
    - [exportPathMap](./api/config/next-config-js/exportPathMap.md): Customize the pages that will be exported as HTML files when using `next export`.
    - [generateBuildId](./api/config/next-config-js/generateBuildId.md): Configure the build id, which is used to identify the current build in which your application is being served.
    - [generateEtags](./api/config/next-config-js/generateEtags.md): Next.js will generate etags for every page by default. Learn more about how to disable etag generation here.
    - [headers](./api/config/next-config-js/headers.md): Add custom HTTP headers to your Next.js app.
    - [htmlLimitedBots](./api/config/next-config-js/htmlLimitedBots.md): Specify a list of user agents that should receive blocking metadata.
    - [httpAgentOptions](./api/config/next-config-js/httpAgentOptions.md): Next.js will automatically use HTTP Keep-Alive by default. Learn more about how to disable HTTP Keep-Alive here.
    - [images](./api/config/next-config-js/images.md): Custom configuration for the next/image loader
    - [cacheHandler](./api/config/next-config-js/incrementalCacheHandlerPath.md): Configure the Next.js cache used for storing and revalidating data to use any external service like Redis, Memcached, or others.
    - [inlineCss](./api/config/next-config-js/inlineCss.md): Enable inline CSS support.
    - [logging](./api/config/next-config-js/logging.md): Configure logging behavior in the terminal when running Next.js in development mode, including fetch logging, incoming requests, and forwarding browser console logs to the terminal.
    - [mdxRs](./api/config/next-config-js/mdxRs.md): Use the new Rust compiler to compile MDX files in the App Router.
    - [onDemandEntries](./api/config/next-config-js/onDemandEntries.md): Configure how Next.js will dispose and keep in memory pages created in development.
    - [optimizePackageImports](./api/config/next-config-js/optimizePackageImports.md): API Reference for optimizePackageImports Next.js Config Option
    - [output](./api/config/next-config-js/output.md): Next.js automatically traces which files are needed by each page to allow for easy deployment of your application. Learn how it works here.
    - [pageExtensions](./api/config/next-config-js/pageExtensions.md): Extend the default page extensions used by Next.js when resolving pages in the Pages Router.
    - [poweredByHeader](./api/config/next-config-js/poweredByHeader.md): Next.js will add the `x-powered-by` header by default. Learn to opt-out of it here.
    - [productionBrowserSourceMaps](./api/config/next-config-js/productionBrowserSourceMaps.md): Enables browser source map generation during the production build.
    - [proxyClientMaxBodySize](./api/config/next-config-js/proxyClientMaxBodySize.md): Configure the maximum request body size when using proxy.
    - [reactCompiler](./api/config/next-config-js/reactCompiler.md): Enable the React Compiler to automatically optimize component rendering.
    - [reactMaxHeadersLength](./api/config/next-config-js/reactMaxHeadersLength.md): The maximum length of the headers that are emitted by React and added to the response.
    - [reactStrictMode](./api/config/next-config-js/reactStrictMode.md): The complete Next.js runtime is now Strict Mode-compliant, learn how to opt-in
    - [redirects](./api/config/next-config-js/redirects.md): Add redirects to your Next.js app.
    - [rewrites](./api/config/next-config-js/rewrites.md): Add rewrites to your Next.js app.
    - [sassOptions](./api/config/next-config-js/sassOptions.md): Configure Sass options in your Next.js application.
    - [serverActions](./api/config/next-config-js/serverActions.md): Configure Server Actions behavior in your Next.js application.
    - [serverComponentsHmrCache](./api/config/next-config-js/serverComponentsHmrCache.md): Configure whether fetch responses in Server Components are cached across HMR refresh requests.
    - [serverExternalPackages](./api/config/next-config-js/serverExternalPackages.md): Opt-out specific dependencies from the Server Components bundling and use native Node.js `require`.
    - [staleTimes](./api/config/next-config-js/staleTimes.md): Learn how to override the invalidation time of the client cache.
    - [staticGeneration*](./api/config/next-config-js/staticGeneration.md): Learn how to configure static generation in your Next.js application.
    - [taint](./api/config/next-config-js/taint.md): Enable tainting Objects and Values.
    - [trailingSlash](./api/config/next-config-js/trailingSlash.md): Configure Next.js pages to resolve with or without a trailing slash.
    - [transpilePackages](./api/config/next-config-js/transpilePackages.md): Automatically transpile and bundle dependencies from local packages (like monorepos) or from external dependencies (`node_modules`).
    - [turbopack](./api/config/next-config-js/turbopack.md): Configure Next.js with Turbopack-specific options
    - [turbopackFileSystemCache](./api/config/next-config-js/turbopackFileSystemCache.md): Learn how to enable FileSystem Caching for Turbopack builds
    - [turbopack.ignoreIssue](./api/config/next-config-js/turbopackIgnoreIssue.md): Suppress specific Turbopack errors and warnings from the CLI output and error overlay.
    - [typedRoutes](./api/config/next-config-js/typedRoutes.md): Enable support for statically typed links.
    - [typescript](./api/config/next-config-js/typescript.md): Configure how Next.js handles TypeScript errors during production builds and specify a custom tsconfig file.
    - [urlImports](./api/config/next-config-js/urlImports.md): Configure Next.js to allow importing modules from external URLs.
    - [useLightningcss](./api/config/next-config-js/useLightningcss.md): Enable experimental support for Lightning CSS.
    - [viewTransition](./api/config/next-config-js/viewTransition.md): Enable ViewTransition API from React in App Router
    - [webpack](./api/config/next-config-js/webpack.md): Learn how to customize the webpack config used by Next.js
    - [webVitalsAttribution](./api/config/next-config-js/webVitalsAttribution.md): Learn how to use the webVitalsAttribution option to pinpoint the source of Web Vitals issues.
  - [TypeScript](./api/config/typescript.md): Next.js provides a TypeScript-first development experience for building your React application.
  - [ESLint](./api/config/eslint.md): Learn how to use and configure the ESLint plugin to catch common issues and problems in a Next.js application.
- [CLI](./api/cli.md): API Reference for the Next.js Command Line Interface (CLI) tools.
  - [create-next-app](./api/cli/create-next-app.md): Create Next.js apps using one command with the create-next-app CLI.
  - [next CLI](./api/cli/next.md): Learn how to run and build your application with the Next.js CLI.
- [Adapters](./api/adapters.md): Build deployment adapters for Next.js platforms and infrastructure.
  - [Configuration](./api/adapters/configuration.md): Configure `adapterPath` or `NEXT_ADAPTER_PATH` to use a custom deployment adapter.
  - [Creating an Adapter](./api/adapters/creating-an-adapter.md): Create an adapter module that implements the `NextAdapter` interface.
  - [API Reference](./api/adapters/api-reference.md): Reference for `modifyConfig` and `onBuildComplete` in the `NextAdapter` interface.
  - [Testing Adapters](./api/adapters/testing-adapters.md): Validate adapters with the Next.js compatibility test harness and custom lifecycle scripts.
  - [Routing with @next/routing](./api/adapters/routing-with-next-routing.md): Use `@next/routing` to apply Next.js route matching behavior in adapters.
  - [Implementing PPR in an Adapter](./api/adapters/implementing-ppr-in-an-adapter.md): Implement Partial Prerendering support in an adapter using fallback output and cache hooks.
  - [Runtime Integration](./api/adapters/runtime-integration.md): Understand how build-time adapters and runtime cache interfaces work together.
  - [Invoking Entrypoints](./api/adapters/invoking-entrypoints.md): Invoke Node.js and Edge build entrypoints with adapter runtime context.
  - [Output Types](./api/adapters/output-types.md): Reference for all build output types exposed to adapters.
  - [Routing Information](./api/adapters/routing-information.md): Reference for routing phases and route fields exposed in `onBuildComplete`.
  - [Use Cases](./api/adapters/use-cases.md): Common patterns and examples for deployment adapter implementations.
- [Edge Runtime](./api/edge.md): API Reference for the Edge Runtime.
- [Turbopack](./api/turbopack.md): Turbopack is an incremental bundler optimized for JavaScript and TypeScript, written in Rust, and built into Next.js.

## [Glossary](./glossary.md)

A glossary of common terms used in Next.js.


## Architecture

How Next.js Works

- [Accessibility](./architecture/accessibility.md): The built-in accessibility features of Next.js.
- [Fast Refresh](./architecture/fast-refresh.md): Fast Refresh is a hot module reloading experience that gives you instantaneous feedback on edits made to your React components.
- [Next.js Compiler](./architecture/nextjs-compiler.md): Next.js Compiler, written in Rust, which transforms and minifies your Next.js application.
- [Supported Browsers](./architecture/supported-browsers.md): Browser support and which JavaScript features are supported by Next.js.


## Optional

