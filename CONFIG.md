# Config files

Root-level config files, nested under this doc in the VS Code Explorer (see `.vscode/settings.json` → `explorer.fileNesting.patterns`) purely to keep the project root uncluttered. This file is what they're nested under instead of `package.json`, since documenting them is a better fit for "parent" than an arbitrary pick of one config among several.

- **package.json** — npm manifest: scripts (`test`, `test:e2e`, ...) and devDependencies (Vite/Vitest, Playwright, http-server, jsdom — all test tooling; the site itself is plain static files, no build step).
- **package-lock.json** — npm-generated dependency lockfile. Don't hand-edit.
- **vitest.config.js** — unit test config: jsdom environment, `tests/unit/**`, timezone pinned to UTC so date-based tests (`calendar.js`) are deterministic across machines/CI.
- **playwright.config.js** — e2e test config: serves the repo exactly as Netlify would (plain static files via `http-server`, no build step) and runs browser tests against that.
- **netlify.toml** — deploy config: publishes the repo as-is (no build command — `index.html` loads `app/js/game.js` as a native ES module, the browser resolves the rest), plus the `/label` redirect to the label tool.
