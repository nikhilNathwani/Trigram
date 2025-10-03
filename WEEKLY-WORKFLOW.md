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
-   Updates `calendar.js` in `app/js/calendar/` to add TOU to the trigrams list
-   Generates announcement image in `app/assets/social/` folder
-   Commits and pushes changes to main branch

### 3. Update Spreadsheet

Mark TOU as **DONE** in the [Trigram Spreadsheet](https://docs.google.com/spreadsheets/d/1_GHU8MLunmLTphSwR-xF5q89bxt-r4IQ/edit?gid=2105180696#gid=2105180696)

### 4. Social Media Post

On **Sunday at ~midnight**, make Instagram post with the generated PNG and caption:

```
Trigram #[trigram number] is now available! Play here: https://trigram.netlify.app
```

---

## Finding New Trigrams

If you need to evaluate a new trigram:

### 1. Pick Candidate

Select an un-triaged trigram (e.g. "ORD") from the spreadsheet

### 2. Check Word-list Viability

```bash
cd tools/automation
python3 get_words.py ORD
```

Inspect the available words of length 4-15 to ensure it would make for a feasible/enjoyable game

### 4. Update Spreadsheet

-   Mark **YES** if suitable for the game
-   Mark **NO** if not suitable
-   Mark **DONE** if trigram has been used in the game

---

## Links

-   **Trigram Spreadsheet**: https://docs.google.com/spreadsheets/d/1_GHU8MLunmLTphSwR-xF5q89bxt-r4IQ/edit?gid=2105180696#gid=2105180696
-   **Live Game**: https://trigram.netlify.app
