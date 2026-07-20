# Trigram

Weekly word puzzle game where every answer must contain a required 3-letter trigram.

## Overview

Trigram is a browser-based game that releases a new challenge each week. Players build increasingly longer valid words that include the week's trigram. The project includes both the game client and a robust content pipeline for generating trigram-specific dictionaries and weekly releases.

## Highlights

- Progressive challenge from 4-letter through 15-letter words
- Deterministic weekly puzzle calendar
- Local persistence for streaks/stats
- Automated release workflow for adding new trigrams
- Data tooling for corpus processing and social asset generation

## Tech Stack

- Astro for the page shell and component templating (`src/`)
- The game itself — game logic, validation, storage, UI orchestration — is vanilla JavaScript loaded as native ES modules, not bundled (`public/js/`; see `tests/TESTING-GUIDE.md` §8 for why)
- PWA manifest for installable web experience
- Python + Bash tooling for data generation and release automation

## Project Structure

```text
src/
    pages/          # index.astro — the one route this site has
    layouts/         # BaseLayout.astro — the <html>/<head> shell
    components/      # One .astro file (+ scoped <style>) per UI piece
    styles/          # variables.css (design tokens) + global.css (reset/app shell)

public/
    js/              # Game logic, validation, storage, UI orchestration — native ES
                      #   modules, untouched/unbundled, copied into dist/ verbatim
    assets/          # Icons and images actually served by the app
    og-image.png, site.webmanifest

data/
    trigram_calendar.json  # Weekly trigram schedule
    trigram-word-lists/    # One JSON word list per trigram
    corpus/                # Source dictionaries and supporting corpus files (gitignored)

tools/
    automation/      # One-command weekly trigram workflow
    utils/           # Dictionary and calendar update scripts
    social/          # Social image generation
    corpus/          # Corpus preprocessing helpers
    label/           # A second, separate static tool this same repo serves

mockups/             # Design reference material (not served — see astro.config.mjs)
```

## Running the Game

From a fresh clone:

```bash
npm install
npm run dev             # astro dev — live app at http://localhost:4321
```

`npm run dev` works standalone: `public/` is Astro's built-in static-passthrough mechanism, so the native-ES-module game code and static assets are served exactly as they'll appear in production, no separate build step needed first.

To build for production:

```bash
npm run build            # astro build, plus a small script step for data/ and tools/label/ (see astro.config.mjs)
npm run preview           # serve the dist/ build locally, the same thing Netlify publishes
```

Netlify runs `npm run build` automatically on deploy (see `netlify.toml`). `data/` (except the two files actually served) and the rest of `tools/` are untouched by the build.

## Weekly Content Workflow

From `tools/automation`:

```bash
./add_new_trigram.sh ABC
```

This workflow validates/generates dictionary data, updates the trigram calendar, and commits/pushes repository changes.

For full operational steps, see `tools/automation/WEEKLY-WORKFLOW.md`.

## Tooling Setup (Python)

If you use social-generation/data scripts, install requirements from `tools/requirements.txt`.

Example:

```bash
cd tools
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Why This Project

Trigram demonstrates product thinking plus workflow engineering: a polished user-facing puzzle experience backed by practical automation for long-term, low-friction content operations.
