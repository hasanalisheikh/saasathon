# D1

Create managed, serverless databases with SQL semantics

> Links below point directly to local Markdown versions of each page.
>
> For other Cloudflare products, see the [Cloudflare documentation directory](https://developers.cloudflare.com/llms.txt).

## Overview

- [Cloudflare D1](./index.md): Build serverless SQL databases on Cloudflare's global network and query them from Workers and Pages projects.

## Getting started

- [Getting started](./get-started/index.md): Create your first D1 database, define a schema, and query it from a Cloudflare Worker.

## Workers Binding API

- [Workers Binding API](./worker-api/index.md): Query D1 databases from a Cloudflare Worker using the D1 Binding API for prepared statements, batching, and type-safe results.
- [D1 Database](./worker-api/d1-database.md): Use the D1Database binding to prepare statements, execute queries, batch operations, and dump a D1 database from a Worker.
- [Prepared statement methods](./worker-api/prepared-statements.md): Bind parameters and run D1 prepared statements using the run, all, first, and raw methods.
- [Return objects](./worker-api/return-object.md): Understand the D1Result and D1ExecResult objects returned by D1 Worker Binding API query methods.

## Wrangler commands

- [Wrangler commands](./wrangler-commands/index.md): Use Wrangler CLI commands to create, manage, and query D1 databases.

## REST API

- [REST API](./rest-api/index.md): Manage and query D1 databases programmatically using the Cloudflare REST API.

## Examples

- [Examples](./examples/index.md): Browse code examples that demonstrate common D1 database operations and patterns.
- [Query D1 from Hono](./examples/d1-and-hono.md): Query D1 from the Hono web framework
- [Export and save D1 database](./examples/backup-d1.md): Export a D1 database and save the backup to R2 storage using Workflows.

## Tutorials

- [Tutorials](./tutorials/index.md): Step-by-step D1 tutorials for building applications, importing data, and using read replication.
- [Build a Comments API](./tutorials/build-a-comments-api.md): Use D1 to add comments to a static blog site. Create a D1 database and build a JSON API with Hono that allows the creation and retrieval of comments.
- [Build a Staff Directory Application](./tutorials/build-a-staff-directory-app.md): Build a staff directory using D1. Users access employee info; admins add new employees within the app.
- [Build an API to access D1 using a proxy Worker](./tutorials/build-an-api-to-access-d1.md): This tutorial shows how to create an API that allows you to securely run queries against a D1 database. The API can be used to customize access controls and/or limit what tables can be queried.

- [Bulk import to D1 using REST API](./tutorials/import-to-d1-with-rest-api.md): This tutorial uses the REST API to import a database into D1.
- [Using D1 Read Replication for your e-commerce website](./tutorials/using-read-replication-for-e-com.md): D1 Read Replication is a feature that allows you to replicate your D1 database to multiple regions. This is useful for your e-commerce website, as it reduces read latencies and improves read throughput.

## Demos and architectures

- [Demos and architectures](./demos/index.md): Explore demo applications and reference architectures that use D1 databases.

## best-practices

- [Import and export data](./best-practices/import-export-data.md): Import existing SQLite tables into D1 or export a D1 database for local use.
- [Local development](./best-practices/local-development.md): Run D1 locally with Wrangler to test your Worker and database before deploying to production.
- [Query a database](./best-practices/query-d1.md): Query D1 using SQL statements through the Workers Binding API, REST API, or Wrangler commands.
- [Global read replication](./best-practices/read-replication.md): Reduce read latency and scale throughput by replicating D1 databases across regions globally.
- [Remote development](./best-practices/remote-development.md): Develop against a D1 database remotely using the Cloudflare dashboard playground.
- [Retry queries](./best-practices/retry-queries.md): Handle transient D1 errors by retrying write queries with exponential backoff.
- [Use D1 from Pages](./best-practices/use-d1-from-pages.md): Bind a D1 database to a Cloudflare Pages project using Pages Functions.
- [Use indexes](./best-practices/use-indexes.md): Improve D1 query performance by creating indexes on frequently queried columns.

## configuration

- [Data location](./configuration/data-location.md): Control where D1 stores your data by setting location hints or jurisdiction constraints.
- [Environments](./configuration/environments.md): Configure separate D1 databases for staging and production Wrangler environments.

## observability

- [Debug D1](./observability/debug-d1.md): Capture exceptions and log error messages returned from D1 database queries.
- [Metrics and analytics](./observability/metrics.md): Query D1 operations and storage metrics via the dashboard.
- [Audit logs](./observability/audit-logs.md): Track administrative actions performed on your D1 databases.

## platform

- [Limits](./platform/limits.md): D1 account and database limits for storage, queries, row sizes, and SQL statements.
- [Choose a data or storage product](./platform/storage-options.md): Compare Cloudflare storage products including D1, KV, R2, and Durable Objects to find the right fit.

## reference

- [Community projects](./reference/community-projects.md): Explore community-built ORMs, query builders, and tools that integrate with D1.
- [Data security](./reference/security.md): D1 encryption and compliance certifications.
- [Generated columns](./reference/generated-columns.md): Use generated columns to store data derived from other columns in the same row.
- [Migrations](./reference/migrations.md): Version your D1 database schema using SQL migration files that you create, list, and apply with Wrangler.
- [Time Travel and backups](./reference/time-travel.md): Restore a D1 database to any minute within the last 30 days using Time Travel point-in-time recovery.

## sql-api

- [Define foreign keys](./sql-api/foreign-keys.md): Enforce relational integrity across D1 tables by defining and deferring foreign key constraints.
- [Query JSON](./sql-api/query-json.md): Extract, insert, and manipulate JSON data stored in D1 using built-in SQLite JSON functions.
- [SQL statements](./sql-api/sql-statements.md): Supported SQL statements, PRAGMA commands, and SQLite extensions available in D1.