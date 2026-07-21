# Config files

Root-level config files, nested under this doc in the VS Code Explorer (see `.vscode/settings.json` → `explorer.fileNesting.patterns`) purely to keep the project root uncluttered. This file is what they're nested under instead of `package.json`, since documenting them is a better fit for "parent" than an arbitrary pick of one config among several.

- **package.json** — npm manifest: scripts (`dev`, `build`, `test`, `test:e2e`, ...) and devDependencies (Astro, Vite, Vitest, Playwright).
- **package-lock.json** — npm-generated dependency lockfile. Don't hand-edit.
- **astro.config.mjs** — Astro build config. Empty by default; the file's real content is a comment explaining why `public/` is passthrough and why `data/` is copied into `dist/` by an explicit build step rather than imported as source.
- **vitest.config.js** — unit test config: jsdom environment, `tests/unit/**`, timezone pinned to UTC so date-based tests (`calendar.js`) are deterministic across machines/CI.
- **playwright.config.js** — e2e test config: builds the Astro site to `dist/` and serves it with `http-server` before running browser tests against it, mirroring what Netlify publishes.
- **netlify.toml** — deploy config: build command/publish dir, pinned Node version, and the `/label` redirect to the label tool.
