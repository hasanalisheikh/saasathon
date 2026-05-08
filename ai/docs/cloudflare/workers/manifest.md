# Workers

Build, deploy, and scale serverless applications globally with low latency and minimal configuration

> Links below point directly to Markdown versions of each page. Any page can also be retrieved as Markdown by sending an `Accept: text/markdown` header to the page's URL without the `index.md` suffix (for example, `curl -H "Accept: text/markdown" https://developers.cloudflare.com/workers/`).
>
> For other Cloudflare products, see the [Cloudflare documentation directory](https://developers.cloudflare.com/llms.txt).
>
> Use [Workers llms-full.txt](https://developers.cloudflare.com/workers/llms-full.txt) for the complete Workers documentation in a single file, intended for offline indexing, bulk vectorization, or large-context models.

## Overview

- [Cloudflare Workers](./overview/index.md): Build and deploy serverless applications across Cloudflare's global network with Workers.

## Examples

- [Examples](./examples/examples.md): Browse code examples and starter templates for Cloudflare Workers.
- [103 Early Hints](./examples/103-early-hints.md): Allow a client to request static assets while waiting for the HTML response.
- [A/B testing with same-URL direct access](./examples/ab-testing.md): Set up an A/B test by controlling what response is served based on cookies. This version supports passing the request through to test and control on the origin, bypassing random assignment.
- [Accessing the Cloudflare Object](./examples/accessing-the-cloudflare-object.md): Access custom Cloudflare properties and control how Cloudflare features are applied to every request.
- [Aggregate requests](./examples/aggregate-requests.md): Send two GET request to two urls and aggregates the responses into one response.
- [Alter headers](./examples/alter-headers.md): Example of how to add, change, or delete headers sent in a request or returned in a response.
- [Auth with headers](./examples/auth-with-headers.md): Allow or deny a request based on a known pre-shared key in a header. This is not meant to replace the WebCrypto API.
- [HTTP Basic Authentication](./examples/basic-auth.md): Shows how to restrict access using the HTTP Basic schema.
- [Block on TLS](./examples/block-on-tls.md): Inspects the incoming request's TLS version and blocks if under TLSv1.2.
- [Bulk origin override](./examples/bulk-origin-proxy.md): Resolve requests to your domain to a set of proxy third-party origin URLs.
- [Bulk redirects](./examples/bulk-redirects.md): Redirect requests to certain URLs based on a mapped object to the request's URL.
- [Using the Cache API](./examples/cache-api.md): Use the Cache API to store responses in Cloudflare's cache.
- [Cache POST requests](./examples/cache-post-request.md): Cache POST requests using the Cache API.
- [Cache Tags using Workers](./examples/cache-tags.md): Send Additional Cache Tags using Workers
- [Cache using fetch](./examples/cache-using-fetch.md): Determine how to cache a resource by setting TTLs, custom cache keys, and cache headers in a fetch request.
- [Conditional response](./examples/conditional-response.md): Return a response based on the incoming request's URL, HTTP method, User Agent, IP address, ASN or device type.
- [CORS header proxy](./examples/cors-header-proxy.md): Add the necessary CORS headers to a third party API response.
- [Country code redirect](./examples/country-code-redirect.md): Redirect a response based on the country code in the header of a visitor.
- [Setting Cron Triggers](./examples/cron-trigger.md): Set a Cron Trigger for your Worker.
- [Data loss prevention](./examples/data-loss-prevention.md): Protect sensitive data to prevent data loss, and send alerts to a webhooks server in the event of a data breach.
- [Debugging logs](./examples/debugging-logs.md): Send debugging information in an errored response to a logging service.
- [Cookie parsing](./examples/extract-cookie-value.md): Given the cookie name, get the value of a cookie. You can also use cookies for A/B testing.
- [Fetch HTML](./examples/fetch-html.md): Send a request to a remote server, read HTML from the response, and serve that HTML.
- [Fetch JSON](./examples/fetch-json.md): Send a GET request and read in JSON from the response. Use to fetch external data.
- [Geolocation: Weather application](./examples/geolocation-app-weather.md): Fetch weather data from an API using the user's geolocation data.
- [Geolocation: Custom Styling](./examples/geolocation-custom-styling.md): Personalize website styling based on localized user time.
- [Geolocation: Hello World](./examples/geolocation-hello-world.md): Get all geolocation data fields and display them in HTML.
- [Hot-link protection](./examples/hot-link-protection.md): Block other websites from linking to your content. This is useful for protecting images.
- [Custom Domain with Images](./examples/images-workers.md): Set up custom domain for Images using a Worker or serve images using a prefix path and Cloudflare registered domain.
- [Logging headers to console](./examples/logging-headers.md): Examine the contents of a Headers object by logging to console with a Map.
- [Modify request property](./examples/modify-request-property.md): Create a modified request with edited properties based off of an incoming request.
- [Modify response](./examples/modify-response.md): Fetch and modify response properties which are immutable by creating a copy first.
- [Multiple Cron Triggers](./examples/multiple-cron-triggers.md): Set multiple Cron Triggers on three different schedules.
- [Post JSON](./examples/post-json.md): Send a POST request with JSON data. Use to share data with external servers.
- [Using timingSafeEqual](./examples/protect-against-timing-attacks.md): Protect against timing attacks by safely comparing values using `timingSafeEqual`.
- [Read POST](./examples/read-post.md): Serve an HTML form, then read POST requests. Use also to read JSON or POST data from an incoming request.
- [Redirect](./examples/redirect.md): Redirect requests from one URL to another or from one set of URLs to another set.
- [Respond with another site](./examples/respond-with-another-site.md): Respond to the Worker request with the response from another website (example.com in this example).
- [Return small HTML page](./examples/return-html.md): Deliver an HTML page from an HTML string directly inside the Worker script.
- [Return JSON](./examples/return-json.md): Return JSON directly from a Worker script, useful for building APIs and middleware.
- [Rewrite links](./examples/rewrite-links.md): Rewrite URL links in HTML using the HTMLRewriter. This is useful for JAMstack websites.
- [Set security headers](./examples/security-headers.md): Set common security headers (X-XSS-Protection, X-Frame-Options, X-Content-Type-Options, Permissions-Policy, Referrer-Policy, Strict-Transport-Security, Content-Security-Policy).
- [Sign requests](./examples/signing-requests.md): Verify a signed request using the HMAC and SHA-256 algorithms or return a 403.
- [Single Page App (SPA) shell with bootstrap data](./examples/spa-shell.md): Use HTMLRewriter to inject prefetched bootstrap data into an SPA shell, eliminating client-side data fetching on initial load. Works with Workers Static Assets or an externally hosted SPA.
- [Stream large JSON](./examples/streaming-json.md): Parse and transform large JSON request and response bodies using streaming.
- [Using the WebSockets API](./examples/websockets.md): Use the WebSockets API to communicate in real time with your Cloudflare Workers.

## Tutorials

- [Tutorials](./tutorials/tutorials.md): Step-by-step Workers tutorials and video guides to help you build projects on Cloudflare.
- [Build a todo list Jamstack application](./tutorials/build-a-jamstack-app.md): This tutorial explains how to build a todo list application using HTML, CSS, and JavaScript.
- [Build a QR code generator](./tutorials/build-a-qr-code-generator.md): This tutorial shows you how to build and publish a Worker application that generates QR codes. The final version of the codebase is available on GitHub.

## Demos and architectures

- [Demos and architectures](./demos-and-architectures/demos.md): Explore demo applications and reference architectures built with Cloudflare Workers.

## Development & testing

- [Development & testing](./development-and-testing/development-testing.md): Develop and test your Workers locally.
- [Supported bindings per development mode](./development-and-testing/bindings-per-env.md): Supported bindings per development mode
- [Environment variables and secrets](./development-and-testing/environment-variables.md): Configuring environment variables and secrets for local development
- [Adding local data](./development-and-testing/local-data.md): Populating local resources with data
- [Share a local dev server](./development-and-testing/local-dev-tunnels.md): Expose a local Wrangler or Vite dev server over a public tunnel URL.
- [Local Explorer](./development-and-testing/local-explorer.md): Browse and edit local binding data from your browser during development.
- [Developing with multiple Workers](./development-and-testing/multi-workers.md): Learn how to develop with multiple Workers using different approaches and configurations.
- [Testing](./development-and-testing/testing.md): Write and run tests for your Cloudflare Workers using Vitest and the Workers testing framework.
- [Vite Plugin](./development-and-testing/vite-plugin.md): Develop and build Cloudflare Workers projects using the Workers Vite plugin.
- [Choosing between Wrangler & Vite](./development-and-testing/wrangler-vs-vite.md): Choosing between Wrangler and Vite for local development

## Playground

- [Playground](./playground/playground.md): Preview and test Cloudflare Workers code in a browser-based sandbox without setup or authentication.

## Configuration

- [Configuration](./configuration/configuration.md): Manage Cloudflare Workers project settings, bindings, and deployment options.
- [Bindings](./configuration/bindings.md): The various bindings that are available to Cloudflare Workers.
- [Compatibility dates](./configuration/compatibility-dates.md): Opt into a specific version of the Workers runtime for your Workers project.
- [Compatibility flags](./configuration/compatibility-flags.md): Opt into a specific features of the Workers runtime for your Workers project.
- [Cron Triggers](./configuration/cron-triggers.md): Enable your Worker to be executed on a schedule.
- [Environment variables](./configuration/environment-variables.md): You can add environment variables, which are a type of binding, to attach text strings or JSON values to your Worker.
- [Integrations](./configuration/integrations.md): Integrate with third-party services and products.
- [APIs](./configuration/apis.md): Integrate Cloudflare Workers with third-party APIs using the Fetch API.
- [External Services](./configuration/external-services.md): Connect Cloudflare Workers to external services using libraries, SDKs, and secure authentication.
- [Multipart upload metadata](./configuration/multipart-upload-metadata.md): Define Workers configuration in JSON metadata for multipart form-data script uploads.
- [Placement](./configuration/placement.md): Control where your Worker runs to reduce latency.
- [Preview URLs](./configuration/previews.md): Preview URLs allow you to preview new versions of your project without deploying it to production.
- [Routes and domains](./configuration/routing.md): Connect your Worker to an external endpoint (via Routes, Custom Domains or a `workers.dev` subdomain) such that it can be accessed by the Internet.
- [Custom Domains](./configuration/custom-domains.md): Connect a Cloudflare Worker to a domain or subdomain with automatic DNS and certificate management.
- [Routes](./configuration/routes.md): Map URL patterns to Cloudflare Workers to run your code on matching requests.
- [workers.dev](./configuration/workers-dev.md): Deploy Cloudflare Workers on a workers.dev subdomain for quick testing and personal projects.
- [Secrets](./configuration/secrets.md): Store sensitive information, like API keys and auth tokens, in your Worker.
- [Workers Sites configuration](./configuration/configuration.md): Configure Workers Sites settings for static asset hosting in your Wrangler configuration file.
- [Versions & Deployments](./configuration/versions-and-deployments.md): Upload versions of Workers and create deployments to release new versions.
- [Gradual deployments](./configuration/gradual-deployments.md): Incrementally deploy code changes to your Workers with gradual deployments.
- [Rollbacks](./configuration/rollbacks.md): Revert to an older version of your Worker.
- [Page Rules](./configuration/workers-with-page-rules.md): Review the interaction between various Page Rules and Workers.

## CI/CD

- [CI/CD](./ci-cd/ci-cd.md): Set up continuous integration and continuous deployment for your Workers.
- [Builds](./ci-cd/builds.md): Use Workers Builds to integrate with Git and automatically build and deploy your Worker when pushing a change
- [Advanced setups](./ci-cd/advanced-setups.md): Learn how to use Workers Builds with more advanced setups
- [Builds API reference](./ci-cd/api-reference.md): Learn how to programmatically trigger builds, manage triggers, and monitor your Workers Builds using the API.
- [Automatic pull requests](./ci-cd/automatic-prs.md): Learn about the pull requests Workers Builds creates to configure your project or resolve issues.
- [Build branches](./ci-cd/build-branches.md): Configure which git branches should trigger a Workers Build
- [Build caching](./ci-cd/build-caching.md): Improve build times by caching build outputs and dependencies
- [Build image](./ci-cd/build-image.md): Understand the build image used in Workers Builds.
- [Build watch paths](./ci-cd/build-watch-paths.md): Reduce compute for your monorepo by specifying paths for Workers Builds to skip
- [Configuration](./ci-cd/configuration.md): Understand the different settings associated with your build.
- [Deploy Hooks](./ci-cd/deploy-hooks.md): Generate unique URLs that trigger new builds when they receive an HTTP POST request.
- [Event subscriptions](./ci-cd/event-subscriptions.md): Subscribe to Workers Builds events and send notifications to Slack, Discord, or webhook endpoints.
- [Git integration](./ci-cd/git-integration.md): Learn how to add and manage your Git integration for Workers Builds
- [GitHub integration](./ci-cd/github-integration.md): Learn how to manage your GitHub integration for Workers Builds
- [GitLab integration](./ci-cd/gitlab-integration.md): Learn how to manage your GitLab integration for Workers Builds
- [Limits & pricing](./ci-cd/limits-and-pricing.md): Limits & pricing for Workers Builds
- [Troubleshooting builds](./ci-cd/troubleshoot.md): Learn how to troubleshoot common and known issues in Workers Builds.
- [External CI/CD](./ci-cd/external-cicd.md): Integrate Workers development into your existing continuous integration and continuous development workflows, such as GitHub Actions or GitLab Pipelines.
- [GitHub Actions](./ci-cd/github-actions.md): Integrate Workers development into your existing GitHub Actions workflows.
- [GitLab CI/CD](./ci-cd/gitlab-cicd.md): Integrate Workers development into your existing GitLab Pipelines workflows.

## Runtime APIs

- [Runtime APIs](./runtime-apis/runtime-apis.md): Explore the JavaScript and web platform APIs available in the Cloudflare Workers runtime.
- [Bindings (env)](./runtime-apis/bindings.md): Worker Bindings that allow for interaction with other Cloudflare Resources.
- [AI](./runtime-apis/workers-wrangler.md): Run generative AI inference and machine learning models on GPUs, without managing servers or infrastructure.
- [Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engineindex.md): Write high-cardinality data and metrics at scale, directly from Workers.
- [Assets](./runtime-apis/binding.md): APIs available in Cloudflare Workers to interact with a collection of static assets. Static assets can be uploaded as part of your Worker.
- [D1](./runtime-apis/worker-api.md): APIs available in Cloudflare Workers to interact with D1.  D1 is Cloudflare's native serverless database.
- [Dispatcher (Workers for Platforms)](./runtime-apis/dynamic-dispatch.md): Let your customers deploy their own code to your platform, and dynamically dispatch requests from your Worker to their Worker.
- [Durable Objects](./runtime-apis/api.md): A globally distributed coordination API with strongly consistent storage.
- [Hyperdrive](https://developers.cloudflare.com/hyperdriveindex.md): Connect to your existing database from Workers, turning your existing regional database into a globally distributed database.
- [Images](./runtime-apis/bindings.md): Store, transform, optimize, and deliver images at scale.
- [KV](./runtime-apis/api.md): Global, low-latency, key-value data storage.
- [Media Transformations](./runtime-apis/bindings.md): Optimize, transform, and extract from short-form video.
- [mTLS](./runtime-apis/mtls.md): Configure your Worker to present a client certificate to services that enforce an mTLS connection.
- [Queues](./runtime-apis/javascript-apis.md): Send and receive messages with guaranteed delivery.
- [R2](./runtime-apis/workers-api-reference.md): APIs available in Cloudflare Workers to read from and write to R2 buckets.  R2 is S3-compatible, zero egress-fee, globally distributed object storage.
- [Rate Limiting](./runtime-apis/rate-limit.md): Define rate limits and interact with them directly from your Cloudflare Worker
- [Secrets Store](./runtime-apis/index.md): Account-level secrets that can be added to Workers applications as a binding.
- [Service bindings](./runtime-apis/service-bindings.md): Facilitate Worker-to-Worker communication.
- [HTTP](./runtime-apis/http.md): Facilitate Worker-to-Worker communication by forwarding Request objects.
- [RPC (WorkerEntrypoint)](./runtime-apis/rpc.md): Facilitate Worker-to-Worker communication via RPC.
- [Stream](./runtime-apis/bindings.md): Upload, manage, and deliver video with Cloudflare Stream.
- [Vectorize](./runtime-apis/client-api.md): APIs available in Cloudflare Workers to interact with Vectorize.  Vectorize is Cloudflare's globally distributed vector database.
- [Version metadata](./runtime-apis/version-metadata.md): Exposes Worker version metadata (`versionID` and `versionTag`). These fields can be added to events emitted from the Worker to send to downstream observability systems.
- [Dynamic Worker Loaders](./runtime-apis/dynamic-workers.md): The Dynamic Worker Loader API, which allows dynamically spawning isolates that run arbitrary code.
- [Cache](./runtime-apis/cache.md): Control reading and writing from the Cloudflare global network cache.
- [Console](./runtime-apis/console.md): Supported methods of the `console` API in Cloudflare Workers
- [Context (ctx)](./runtime-apis/context.md): The Context API in Cloudflare Workers, including props, exports, waitUntil and passThroughOnException.
- [Encoding](./runtime-apis/encoding.md): Takes a stream of code points as input and emits a stream of bytes.
- [EventSource](./runtime-apis/eventsource.md): EventSource is a server-sent event API that allows a server to push events to a client.
- [Fetch](./runtime-apis/fetch.md): An interface for asynchronously fetching resources via HTTP requests inside of a Worker.
- [Handlers](./runtime-apis/handlers.md): Methods, such as `fetch()`, on Workers that can receive and process external inputs.
- [Email Handler](./runtime-apis/runtime-api.md): Process incoming emails in Cloudflare Workers using the Email Routing runtime API.
- [Fetch Handler](./runtime-apis/fetch.md): Handle incoming HTTP requests in Cloudflare Workers using the fetch() handler and return responses.
- [Queue Handler](./runtime-apis/javascript-apis.md): Consume messages from Cloudflare Queues using the queue handler in Workers.
- [Scheduled Handler](./runtime-apis/scheduled.md): Run Workers on a recurring schedule using the scheduled() handler and Cron Triggers.
- [Tail Handler](./runtime-apis/tail.md): Process real-time logs from producer Workers using the tail() handler in Tail Workers.
- [Headers](./runtime-apis/headers.md): Access HTTP request and response headers.
- [HTMLRewriter](./runtime-apis/html-rewriter.md): Build comprehensive and expressive HTML parsers inside of a Worker application.
- [MessageChannel](./runtime-apis/messagechannel.md): Channel messaging with MessageChannel and MessagePort
- [Node.js compatibility](./runtime-apis/nodejs.md): Node.js APIs available in Cloudflare Workers
- [assert](./runtime-apis/assert.md): Use the Node.js assert module in Cloudflare Workers for testing assertions and value comparisons.
- [AsyncLocalStorage](./runtime-apis/asynclocalstorage.md): Use the Node.js AsyncLocalStorage API in Cloudflare Workers to maintain context across asynchronous operations.
- [Buffer](./runtime-apis/buffer.md): Use the Node.js Buffer API in Cloudflare Workers to manipulate binary data with encoding and decoding support.
- [crypto](./runtime-apis/crypto.md): Use the Node.js crypto module in Cloudflare Workers for hashing, encryption, signing, and verification.
- [Diagnostics Channel](./runtime-apis/diagnostics-channel.md): Use the Node.js diagnostics_channel API in Cloudflare Workers for low-overhead diagnostic event reporting.
- [dns](./runtime-apis/dns.md): Use the Node.js dns module in Cloudflare Workers for DNS name resolution via DNS over HTTPS.
- [EventEmitter](./runtime-apis/eventemitter.md): Use the Node.js EventEmitter API in Cloudflare Workers to emit and listen for named events.
- [fs](./runtime-apis/fs.md): Use the Node.js fs module in Cloudflare Workers to access a virtual file system for reading and writing files.
- [http](./runtime-apis/http.md): Use the Node.js http module in Cloudflare Workers for client and server-side HTTP functionality.
- [https](./runtime-apis/https.md): Use the Node.js https module in Cloudflare Workers for TLS-encrypted HTTP client and server functionality.
- [net](./runtime-apis/net.md): Use the Node.js net module in Cloudflare Workers to create TCP socket connections to external servers.
- [path](./runtime-apis/path.md): Use the Node.js path module in Cloudflare Workers for file and directory path manipulation utilities.
- [process](./runtime-apis/process.md): Use the Node.js process module in Cloudflare Workers for environment variables, event handling, and runtime information.
- [Streams](./runtime-apis/streams.md): Use the Node.js streams API in Cloudflare Workers for readable, writable, and transform stream operations.
- [StringDecoder](./runtime-apis/string-decoder.md): Use the Node.js string_decoder module in Cloudflare Workers for decoding buffer objects into strings.
- [test](./runtime-apis/test.md): Use the Node.js test module MockTracker API in Cloudflare Workers for tracking and managing mock objects.
- [timers](./runtime-apis/timers.md): Use the Node.js timers API in Cloudflare Workers to schedule functions with setTimeout, setInterval, and setImmediate.
- [tls](./runtime-apis/tls.md): Use the Node.js tls module in Cloudflare Workers to create secure TLS connections to external services.
- [url](./runtime-apis/url.md): Use the Node.js url module in Workers for domain-to-ASCII and domain-to-Unicode conversions.
- [util](./runtime-apis/util.md): Use the Node.js util module in Workers for promisify, callbackify, types, and MIMEType support.
- [zlib](./runtime-apis/zlib.md): Use the Node.js zlib module in Workers for Gzip, Deflate, and Brotli compression.
- [Performance and timers](./runtime-apis/performance.md): Measure timing, performance, and timing of subrequests and other operations.
- [Request](./runtime-apis/request.md): Interface that represents an HTTP request.
- [Response](./runtime-apis/response.md): Interface that represents an HTTP response.
- [Remote-procedure call (RPC)](./runtime-apis/rpc.md): The built-in, JavaScript-native RPC system built into Workers and Durable Objects.
- [Error handling](./runtime-apis/error-handling.md): How exceptions, stack traces, and logging works with the Workers RPC system.
- [Lifecycle](./runtime-apis/lifecycle.md): Memory management, resource management, and the lifecycle of RPC stubs.
- [Reserved Methods](./runtime-apis/reserved-methods.md): Reserved methods with special behavior that are treated differently.
- [TypeScript](./runtime-apis/typescript.md): How TypeScript types for your Worker or Durable Object's RPC methods are generated and exposed to clients
- [Visibility and Security Model](./runtime-apis/visibility.md): Which properties are and are not exposed to clients that communicate with your Worker or Durable Object via RPC
- [Scheduler](./runtime-apis/scheduler.md): Use the scheduler.wait() API to delay execution in Workers.
- [Streams](./runtime-apis/streams.md): A web standard API that allows JavaScript to programmatically access and process streams of data.
- [ReadableStream](./runtime-apis/readablestream.md): Learn about the ReadableStream API for reading streamed data in Cloudflare Workers.
- [ReadableStream BYOBReader](./runtime-apis/readablestreambyobreader.md): Use ReadableStreamBYOBReader in Workers to read streamed data into your own buffer.
- [ReadableStream DefaultReader](./runtime-apis/readablestreamdefaultreader.md): Use ReadableStreamDefaultReader in Workers to read chunks from a ReadableStream.
- [TransformStream](./runtime-apis/transformstream.md): Use the TransformStream API in Workers to pipe data between readable and writable streams.
- [WritableStream](./runtime-apis/writablestream.md): Use the WritableStream API in Workers to write data to a stream destination.
- [WritableStream DefaultWriter](./runtime-apis/writablestreamdefaultwriter.md): Use WritableStreamDefaultWriter in Workers to write data directly to a WritableStream.
- [TCP sockets](./runtime-apis/tcp-sockets.md): Use the `connect()` API to create outbound TCP connections from Workers.
- [Web Crypto](./runtime-apis/web-crypto.md): A set of low-level functions for common cryptographic tasks.
- [Web standards](./runtime-apis/web-standards.md): Standardized APIs for use by Workers running on Cloudflare's global network.
- [WebAssembly (Wasm)](./runtime-apis/webassembly.md): Execute code written in a language other than JavaScript or write an entire Cloudflare Worker in Rust.
- [Wasm in JavaScript](./runtime-apis/javascript.md): Import and instantiate WebAssembly modules in Cloudflare Workers using JavaScript.
- [WebSockets](./runtime-apis/websockets.md): Communicate in real time with your Cloudflare Workers.

## Static Assets

- [Static Assets](./static-assets/static-assets.md): Create full-stack applications deployed to Cloudflare Workers.
- [Billing and Limitations](./static-assets/billing-and-limitations.md): Billing, troubleshooting, and limitations for Static assets on Workers
- [Direct Uploads](./static-assets/direct-upload.md): Upload assets through the Workers API.
- [Get Started](./static-assets/get-started.md): Run front-end websites â€” static or dynamic â€” directly on Cloudflare's global network.
- [Headers](./static-assets/headers.md): Learn about default and custom headers for Workers static assets, including Cache-Control, ETag, and Content-Type behavior.
- [Migrate from Pages to Workers](./static-assets/migrate-from-pages.md): A guide for migrating from Cloudflare Pages to Cloudflare Workers. Includes a compatibility matrix for comparing the features of Cloudflare Workers and Pages.
- [Migrate from Pages to Workers](./static-assets/migrate-from-pages.md): A guide for migrating from Cloudflare Pages to Cloudflare Workers. Includes a compatibility matrix for comparing the features of Cloudflare Workers and Pages.
- [Redirects](./static-assets/redirects.md): Configure redirect rules for Workers static assets using a _redirects file.
- [Gradual rollouts](./static-assets/gradual-rollouts.md): Provide static asset routing solutions for gradual Worker deployments.
- [HTML handling](./static-assets/html-handling.md): How to configure a HTML handling and trailing slashes for the static assets of your Worker.
- [Serving a subdirectory](./static-assets/serving-a-subdirectory.md): How to configure a Worker with static assets on a subpath.
- [Full-stack application](./static-assets/full-stack-application.md): How to configure and use a full-stack application with Workers.
- [Single Page Application (SPA)](./static-assets/single-page-application.md): How to configure and use a Single Page Application (SPA) with Workers.
- [Static Site Generation (SSG) and custom 404 pages](./static-assets/static-site-generation.md): How to configure a Static Site Generation (SSG) application and custom 404 pages with Workers.
- [Worker script](./static-assets/worker-script.md): How the presence of a Worker script influences static asset routing and the related configuration options.

## Testing

- [Miniflare](./testing/miniflare.md): Simulate and test Cloudflare Workers locally with Miniflare, a fully-local development simulator.
- [Compatibility Dates](./testing/compatibility.md): Configure compatibility dates and flags in Miniflare to match Cloudflare Workers runtime behavior.
- [Fetch Events](./testing/fetch.md): Dispatch and test HTTP fetch events in Miniflare for Cloudflare Workers.
- [Modules](./testing/modules.md)
- [Multiple Workers](./testing/multiple-workers.md)
- [Scheduled Events](./testing/scheduled.md)
- [Web Standards](./testing/standards.md)
- [Variables and Secrets](./testing/variables-secrets.md)
- [WebSockets](./testing/web-sockets.md)
- [Attaching a Debugger](./testing/debugger.md): Attach a Node.js debugger to Miniflare for setting breakpoints and inspecting Cloudflare Workers code.
- [Live Reload](./testing/live-reload.md): Enable automatic browser refresh in Miniflare when your Workers script changes during local development.
- [Get Started](./testing/get-started.md): Install and configure the Miniflare API to dispatch events and test Cloudflare Workers locally.
- [Migrating from Version 2](./testing/from-v2.md): Migrate from Miniflare v2 to v3, which uses the workerd runtime for full Workers compatibility.
- [Cache](./testing/cache.md)
- [D1](./testing/d1.md)
- [KV](./testing/kv.md)
- [Writing tests](./testing/writing-tests.md): Write integration tests against Workers using Miniflare.
- [Wrangler's unstable_startWorker()](./testing/unstable_startworker.md): Write integration tests using Wrangler's `unstable_startWorker()` API
- [Vitest integration](./testing/vitest-integration.md): Run unit and integration tests for Cloudflare Workers inside the Workers runtime using the Vitest integration.
- [Configuration](./testing/configuration.md): Vitest configuration specific to the Workers integration.
- [Debugging](./testing/debugging.md): Debug your Workers tests with Vitest.
- [Isolation and concurrency](./testing/isolation-and-concurrency.md): Review how the Workers Vitest integration runs your tests, how it isolates tests from each other, and how it imports modules.
- [Known issues](./testing/known-issues.md): Explore the known issues associated with the Workers Vitest integration.
- [Recipes and examples](./testing/recipes.md): Examples that demonstrate how to write unit and integration tests with the Workers Vitest integration.
- [Test APIs](./testing/test-apis.md): Runtime helpers for writing tests, exported from `cloudflare:workers` and `cloudflare:test`.
- [Write your first test](./testing/write-your-first-test.md): Write tests against Workers using Vitest

## Observability

- [Observability](./observability/observability.md): Understand how your Worker projects are performing via logs, traces, metrics, and other data sources.
- [DevTools](./observability/dev-tools.md): Use Chrome DevTools to debug, profile, and inspect Cloudflare Workers locally.
- [Breakpoints](./observability/breakpoints.md): Debug your local and deployed Workers using breakpoints.
- [Profiling CPU usage](./observability/cpu-usage.md): Learn how to profile CPU usage and ensure CPU-time per request stays under Workers limits
- [Profiling Memory](./observability/memory-usage.md): Profile memory usage with DevTools snapshots to optimize Workers and avoid OOM errors.
- [Errors and exceptions](./observability/errors.md): Review Workers errors and exceptions.
- [Exporting OpenTelemetry Data](./observability/exporting-opentelemetry-data.md): Export traces and logs from Cloudflare Workers to any OpenTelemetry-compatible destination.
- [Logs](./observability/logs.md): Access, filter, and export logs from Cloudflare Workers for troubleshooting.
- [Workers Logpush](./observability/logpush.md): Send Workers Trace Event Logs to a supported third party, such as a storage or logging provider.
- [Real-time logs](./observability/real-time-logs.md): Debug your Worker application by accessing logs and exceptions through the Cloudflare dashboard or `wrangler tail`.
- [Tail Workers](./observability/tail-workers.md): Track and log Workers on invocation by assigning a Tail Worker to your projects.
- [Workers Logs](./observability/workers-logs.md): Store, filter, and analyze log data emitted from Cloudflare Workers.
- [Metrics and analytics](./observability/metrics-and-analytics.md): Diagnose issues with Workers metrics, and review request data for a zone with Workers analytics.
- [Query Builder](./observability/query-builder.md): Write structured queries to investigate and visualize your telemetry data.
- [Source maps and stack traces](./observability/source-maps.md): Adding source maps and generating stack traces for Workers.
- [Traces](./observability/traces.md): Gain end-to-end visibility into request flows across your Workers application with automatic tracing instrumentation.
- [Known limitations](./observability/known-limitations.md)
- [Spans and attributes](./observability/spans-and-attributes.md): Review the spans and attributes automatically captured by Workers tracing, including fetch calls, bindings, and handler invocations.

## Vite plugin

- [Get started](./vite-plugin/get-started.md): Get started with the Vite plugin
- [API](./vite-plugin/api.md): Vite plugin API
- [Cloudflare Environments](./vite-plugin/cloudflare-environments.md): Using Cloudflare environments with the Vite plugin
- [Debugging](./vite-plugin/debugging.md): Debugging with the Vite plugin
- [Migrating from wrangler dev](./vite-plugin/migrating-from-wrangler-dev.md): Migrating from wrangler dev to the Vite plugin
- [Non-JavaScript modules](./vite-plugin/non-javascript-modules.md): Additional module types that can be imported in your Worker
- [Programmatic configuration](./vite-plugin/programmatic-configuration.md): Configure Workers programmatically using the Vite plugin
- [Secrets](./vite-plugin/secrets.md): Using secrets with the Vite plugin
- [Static Assets](./vite-plugin/static-assets.md): Static assets and the Vite plugin
- [Vite Environments](./vite-plugin/vite-environments.md): Vite environments and the Vite plugin
- [Tutorial - React SPA with an API](./vite-plugin/tutorial.md): Create a React SPA with an API Worker using the Vite plugin

## Languages

- [Languages](./languages/languages.md): Languages supported on Workers, a polyglot platform.
- [JavaScript](./languages/javascript.md): Write Cloudflare Workers using JavaScript standards and web platform APIs.
- [Examples](./languages/examples.md): Browse JavaScript code examples for Cloudflare Workers.

- [TypeScript](./languages/typescript.md): Use TypeScript with fully typed APIs to build Cloudflare Workers.
- [Examples](./languages/examples.md): Browse TypeScript code examples for Cloudflare Workers.

## Glossary

- [Glossary](./glossary/glossary.md): Definitions of terms used in the Cloudflare Workers documentation.

## best-practices

- [Workers Best Practices](./best-practices/workers-best-practices.md): Code patterns and configuration guidance for building fast, reliable, observable, and secure Workers.

## databases

- [Connect to databases](./databases/connecting-to-databases.md): Learn about the different kinds of database integrations Cloudflare supports.
- [Cloudflare D1](./databases/d1.md): Cloudflareâ€™s native serverless database.
- [Hyperdrive](./databases/hyperdrive.md): Use Workers to accelerate queries you make to existing databases.
- [3rd Party Integrations](./databases/third-party-integrations.md): Connect to third-party databases such as Supabase
- [Supabase](./databases/supabase.md): Connect Cloudflare Workers to a Supabase PostgreSQL database using the Supabase client or Hyperdrive.

## framework-guides

- [Agents SDK](./framework-guides/agents.md): Build AI agents on Cloudflare Workers using the Agents SDK.
- [Hono](./framework-guides/hono.md): Build lightweight web APIs on Cloudflare Workers using the Hono framework.
- [Deploy an existing project](./framework-guides/automatic-configuration.md): Learn how Wrangler automatically detects and configures your project for Cloudflare Workers.
- [Hono](./framework-guides/hono.md): Build lightweight web APIs on Cloudflare Workers using the Hono framework.
- [Next.js](./framework-guides/nextjs.md): Create an Next.js application and deploy it to Cloudflare Workers with Workers Assets.
- [React + Vite](./framework-guides/react.md): Create a React application and deploy it to Cloudflare Workers with Workers Assets.

## get-started

- [Dashboard](./get-started/dashboard.md): Create and deploy a Cloudflare Worker using the Cloudflare dashboard.
- [CLI](./get-started/guide.md): Set up and deploy your first Cloudflare Worker using Wrangler, the command-line interface.
- [Prompting](./get-started/prompting.md): Build Workers apps with AI prompts and MCP servers.
- [Templates](./get-started/quickstarts.md): GitHub repositories that are designed to be a starting point for building a new Cloudflare Workers project.

## platform

- [Infrastructure as Code (IaC)](./platform/infrastructure-as-code.md): Deploy and manage Cloudflare Workers using Terraform, Pulumi, and the Cloudflare API SDKs.
- [Known issues](./platform/known-issues.md): Known issues and bugs to be aware of when using Workers.
- [Limits](./platform/limits.md): Cloudflare Workers plan and platform limits.
- [Choose a data or storage product](./platform/storage-options.md): Storage and database options available on Cloudflare's developer platform.
- [Workers for Platforms](./platform/workers-for-platforms.md): Deploy custom code on behalf of your users or let your users directly deploy their own code to your platform, managing infrastructure.

## reference

- [How the Cache works](./reference/how-the-cache-works.md): How Workers interacts with the Cloudflare cache.
- [How Workers works](./reference/how-workers-works.md): The difference between the Workers runtime versus traditional browsers and Node.js.
- [Migrate from Service Workers to ES Modules](./reference/migrate-to-module-workers.md): Write your Worker code in ES modules syntax for an optimized experience.
- [Protocols](./reference/protocols.md): Supported protocols on the Workers platform.
- [Security model](./reference/security-model.md): Understand the Workers security architecture, including V8 isolate sandboxing and Spectre mitigations.

## wrangler

- [API](./wrangler/api.md): A set of programmatic APIs that can be integrated with local Cloudflare Workers-related workflows.
- [Bundling](./wrangler/bundling.md): Review Wrangler's default bundling.
- [Commands](./wrangler/commands.md): Create, develop, and deploy your Cloudflare Workers with Wrangler commands.
- [Browser](./wrangler/browser.md): Wrangler commands for interacting with Cloudflare Browser Run.
- [Certificates](./wrangler/certificates.md): Wrangler commands for managing mTLS and CA certificates, for use standalone or with Hyperdrive.
- [D1](./wrangler/d1.md): Wrangler commands for interacting with Cloudflare D1.
- [Authentication](./wrangler/authentication.md): Authenticate Wrangler with your Cloudflare account.
- [Environments](./wrangler/environments.md): Configure different environments for your Worker projects.
- [Install and Update](./wrangler/install-update.md): Install and keep Wrangler up to date.
- [General commands](./wrangler/general.md): General Wrangler commands for authentication, telemetry, and shell completions.
- [KV](./wrangler/kv.md): Wrangler commands for managing Workers KV namespaces and key-value pairs.
- [Secrets Store](./wrangler/secrets-store.md): Wrangler commands for managing account secrets within a Secrets Store.
- [Tunnel](./wrangler/tunnel.md): Wrangler commands for managing Cloudflare Tunnels.
- [Workers](./wrangler/index.md): Wrangler commands for creating, developing, deploying, and managing Workers.
- [Configuration](./wrangler/configuration.md): Use a configuration file to customize the development and deployment setup for your Worker project and other Developer Platform products.
- [Custom builds](./wrangler/custom-builds.md): Customize how your code is compiled, before being processed by Wrangler.
- [System environment variables](./wrangler/system-environment-variables.md): Local environment variables that can change Wrangler's behavior.
