# Bun

> All-in-one JavaScript runtime, package manager, test runner, and bundler.

## Core Features

- **Performance**: Written in Zig and powered by JavaScriptCore. Extremely fast startup times and low memory overhead.
- **Native TypeScript/JSX**: Executes `.ts`, `.tsx`, and `.jsx` files natively without transpilation steps.
- **Package Manager**: `bun install` is significantly faster than `npm` or `yarn`. Uses `bun.lockb` (binary lockfile).
- **Test Runner**: `bun test` is a fast, Jest-compatible test runner.
- **Bundler**: `bun build` for bundling JavaScript and TypeScript.

## Usage

- `bun install`: Install dependencies.
- `bun run <script>`: Run a script defined in `package.json`.
- `bun test`: Run tests.
- `bun x <package>`: Execute a package (like `npx`).
- `bun dev`: Typical command for starting development servers.

## Configuration

- **`bunfig.toml`**: (Optional) Configure Bun-specific settings.
- **Environment Variables**: Automatically loads `.env` files. Access via `Bun.env` (recommended) or `process.env`.

## AI Agent Integration

- **Rapid Loop**: Startup speed minimizes latency in the "generate-run-verify" cycle.
- **Unified Tooling**: Reduces environment configuration complexity by replacing multiple tools with one.
