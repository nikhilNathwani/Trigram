# CLAUDE.md

Operating notes for AI assistants working in this repo. For project overview, structure, and setup, see `README.md` first — this file only covers things worth stating explicitly so they don't get silently violated.

## Architecture rules — don't violate without discussing first

- **No build step, ever.** `index.html` loads `app/js/ui/view.js` and `app/js/ui/stats.js` directly as native ES modules (`<script type="module">`) — no bundler. Vite was tried once specifically for this and deliberately dropped once the code was real ES modules the browser could load natively; see `CONFIG.md`.
- **Every file in `app/js/` is a real ES module** (`import`/`export`), including `ui/generateBoard.js`. Nothing here should go back to a classic `<script>` tag, or reach for global state (`window.X`), without a concretely verified reason — not just an old comment asserting one.
- **`app/js/game.js` is the sole owner of game state**, and the only file allowed to mutate it, via `addLetter`/`deleteLetter`/`submitGuess`. It dispatches events on `gameEvents` (a plain `EventTarget`) and has no idea the UI exists — don't add a direct call from `game.js` into any `ui/*.js` file.
- **`ui/view.js` and `ui/stats.js` are independent subscribers** to `gameEvents` — they deliberately don't import each other. Both are separate `<script type="module">` entry points in `index.html` for exactly this reason. If you add a third UI module that self-subscribes to `gameEvents`, it needs its own entry point too (or an import from something that already has one) — otherwise it silently never runs. This exact bug happened once in production; see the "stats dialog" regression test in `tests/e2e/gameplay.spec.js`.
- **`app/js/constants.js`** is the single source of truth for word-length/round-size numbers (4, 15, 3, and the derived 12/9). Never hardcode these elsewhere — import from here.
- **`app/js/interactionHandler.js`** is the only file that should translate raw DOM input (keyboard/mouse events) into calls on `game.js`'s action functions.

## Before considering a change done

- Run `npm run test` (Vitest, unit) and `npm run test:e2e` (Playwright, real Chromium) — or `npm run test:all` for both. All must be green.
- If the change affects *how* a module gets loaded (not just what it does), manually trace the import graph from `index.html`'s `<script>` tags and confirm every module that should run is still reachable — a silently-orphaned module can still leave the test suite green if nothing in it inspects the affected screen's actual rendered content, not just that it opens.
- If a design choice is being justified by an existing code comment that asserts a hard constraint ("must stay X," "can't do Y"), verify that constraint empirically before building around it — comments go stale as the rest of the code changes around them.

## Collaboration expectations

This is a live app with real users, and the project's history includes at least one change that passed review and a green test suite (twice) before failing silently in production (see the `ui/stats.js` orphaning note above). Because of that:

- **State risk level up front, unprompted**, for any non-trivial change — don't wait to be asked.
- **Before stating an exhaustive or negative claim** ("no other differences," "that's everything," "only cause") — actually run the check (diff, grep, full test suite) and show it, or say plainly that it's an assumption, not a verified fact.

## Docs map

- `README.md` — project overview, structure, running the app, weekly content workflow.
- `CONFIG.md` — what each root-level config file does.
- `tests/TESTING-GUIDE.md` — a from-scratch JS testing tutorial written through this codebase's real history; read before writing new tests.
- `tools/automation/WEEKLY-WORKFLOW.md` — the weekly trigram release process.

## Style

- Comments explain *why*, not *what* — this codebase leans on that convention throughout. Match it; don't add comments that just restate the code.
- Keep the dependency footprint minimal. This is a deliberate, repeated choice in this project's history, not an oversight — treat a new dependency or build step as something to flag and confirm, not default to.

## Root hygiene

The user actively prefers an uncluttered project root — this shows up repeatedly across this project's history (`CONFIG.md` + VS Code file-nesting collapsing root config files, docs relocated into the folders they document, `CLAUDE.md` itself moved from root into `.claude/`, unused files pruned). When a genuine opportunity fits, keep applying this. But treat it as a preference to apply with judgment, not a rule to maximize — over-pruning the root causes exactly the kind of surprise/breakage this project's history has otherwise been trying to avoid. Guardrails:

- **Prefer visual hiding over physically moving a file.** VS Code `files.exclude`/file-nesting declutters the sidebar without touching how any tool finds the file — reversible, zero risk. Actually relocating a file is a bigger change; reach for it only when hiding isn't enough (the file's *location*, not just its visibility, is the actual clutter).
- **Verify tool discovery before moving anything — don't assume a file can move.** Plenty of root files are read from a fixed, conventional path by some tool (`package.json`, `.gitignore`, `netlify.toml`, `vitest.config.js`, `playwright.config.js`) — moving them breaks that tool unless it's explicitly reconfigured, and some don't support relocation at all. This is exactly what got checked (official docs, not assumption) before moving `CLAUDE.md` into `.claude/`.
- **Grep for references before moving.** A relocated file can silently break relative paths in other docs, scripts, imports, or `.gitignore`/`files.exclude` patterns pointing at the old location.
- **Don't fight ecosystem convention for tidiness alone.** A file being expected at a specific path by common practice — even if it's visually hidden from the sidebar — is a legitimate reason to leave its actual path alone.
