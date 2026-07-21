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

- Vanilla JavaScript, HTML, CSS
- PWA manifest for installable web experience
- Python + Bash tooling for data generation and release automation

## Project Structure

```text
app/
    js/                    # Core game logic, validation, storage, UI orchestration
    css/                   # Styles
    assets/                # Icons and static assets

data/
    trigram_calendar.json  # Weekly trigram schedule
    trigram-word-lists/    # One JSON word list per trigram
    corpus/                # Source dictionaries and supporting corpus files

tools/
    automation/            # One-command weekly trigram workflow
    utils/                 # Dictionary and calendar update scripts
    social/                # Social image generation
    corpus/                # Corpus preprocessing helpers
    label/                 # A second, separate static tool this same repo serves

mockups/                   # Design reference material (not served)
```

## Running the Game

No build step: `index.html` loads `app/js/ui/view.js` and `app/js/ui/stats.js` as native ES modules, and the browser resolves the rest of the import graph itself. From a fresh clone:

```bash
npm install
```

Then open `index.html` in a browser, or serve the repo as static files with any local HTTP server (`npx http-server .` works, and is what the e2e tests use — see `playwright.config.js`). Netlify publishes the repo as-is, no build command (see `netlify.toml`). See `tests/TESTING-GUIDE.md` §8 for why the app is structured this way.

## Weekly Content Workflow

From `tools/automation`:

```bash
./add_new_trigram.sh ABC
```

This workflow validates/generates dictionary data, updates the trigram calendar, and commits/pushes repository changes.

For full operational steps, see `tools/automation/WEEKLY-WORKFLOW.md`.

## Tooling Setup (Python)

If you use social-generation/data scripts, install requirements from `tools/requirements.txt`. The venv lives at the repo root — `tools/automation`'s scripts activate it via a relative `../../.venv/bin/activate`, so creating it anywhere else (e.g. inside `tools/`) leaves them unable to find it.

Example (from the repo root):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r tools/requirements.txt
```

## Why This Project

Trigram demonstrates product thinking plus workflow engineering: a polished user-facing puzzle experience backed by practical automation for long-term, low-friction content operations.
