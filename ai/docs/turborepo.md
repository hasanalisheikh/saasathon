# Turborepo

> High-performance build system for JavaScript and TypeScript monorepos.

## Core Concepts

- **Content-Aware Caching**: Turborepo hashes source files, dependencies, environment variables, and build configuration. If the hash matches a previous execution, Turborepo restores the cached artifacts (e.g., `dist/`, `.next/`) in milliseconds.
- **Task Graphs**: Understands relationships between workspaces. Uses `dependsOn` to determine task order and execute in parallel where possible.
- **Incremental Builds**: Only executes tasks for workspaces that have changed.
- **Remote Caching**: Share cache artifacts across teams or CI/CD environments.

## Configuration (`turbo.json`)

The `turbo.json` file in the monorepo root is the primary configuration point.

### Key Fields

- **`tasks`**: Pipeline of tasks (e.g., `build`, `test`, `lint`).
  - `dependsOn`: Dependencies for a task (use `^` for workspace dependencies).
  - `outputs`: Files or directories to cache.
  - `inputs`: Files that impact the task's hash.
- **`globalDependencies`**: Files that invalidate the cache for ALL tasks (e.g., root `tsconfig.json`).
- **`globalEnv`**: Env variables that impact the cache key for all tasks.

## Usage

- `turbo run <task>`: Run a task across all workspaces.
- `turbo run <task> --filter=<workspace>`: Run a task on specific workspaces.
- `turbo run <task> --dry-run`: Inspect the task graph before execution.

## Monorepo Structure

- `apps/*`: Application workspaces (e.g., `web`, `api`).
- `packages/*`: Shared library workspaces (e.g., `ui`, `eslint-config`).
- `package.json` (root): Defines workspaces and global devDependencies.
