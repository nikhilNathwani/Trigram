# Weekly Trigram Update Workflow

## Adding a New Trigram

### 1. Select Next Trigram

Choose the next trigram (e.g. "TOU"). _See instructions below if a new trigram needs to be found first._

### 2. Run Automation Script

```bash
cd tools/automation
./add_new_trigram.sh TOU
```

This script automatically:

-   Adds TOU's dictionary to `data/trigram-word-lists/` folder
-   Updates `data/trigram_calendar.json` to add TOU to the trigrams list
-   Generates announcement image in `tools/social/instagram_posts/` folder
-   Commits and pushes changes to main branch

### 3. Nothing to mark

TOU now shows as **SCHEDULED** (then **DONE** once its week passes) in [Browse](https://trigram.netlify.app/label/browse) automatically — that status comes from `data/trigram_calendar.json`, not from a label. (The old Google Sheet is retired as of 2026-09-26; labels live only in Firestore.)

### 4. Social Media Post

On **Sunday at ~midnight**, make Instagram post with the generated PNG and caption:

```
Trigram #[trigram number] is now available! Play here: https://trigram.netlify.app
```

---

## Finding New Trigrams

If you need to evaluate a new trigram:

### 1. Pick Candidate

In [Browse](https://trigram.netlify.app/label/browse), search (e.g. `DE`) and/or filter to **Unlabeled** or **YES**; sort by **Words** to size up options.

### 2. Check Word-list Viability

Click ▸ (or press Enter on a row) to see its words of length 4-15 — the same list `get_words.py ORD` prints, computed from `data/corpus/`. Make sure it would make for a feasible/enjoyable game.

### 3. Label It

Pick **YES** / **MAYBE** / **NO** in the row's dropdown (or focus the row and press Y / M / N; Delete clears) and type a comment. Saves to Firestore immediately. The swipe-style label queue at [/label](https://trigram.netlify.app/label) writes to the same place.

---

## Links

-   **Browse / label trigrams**: https://trigram.netlify.app/label/browse (queue: `/label`)
-   **Old Trigram Spreadsheet (retired 2026-09-26, archive only)**: https://docs.google.com/spreadsheets/d/1_GHU8MLunmLTphSwR-xF5q89bxt-r4IQ/edit?gid=2105180696#gid=2105180696
-   **Live Game**: https://trigram.netlify.app
