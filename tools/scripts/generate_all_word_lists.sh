#!/bin/bash
# Generates missing word-list JSONs for all trigrams in all_trigrams_4_to_15.txt.
# Safe to re-run: skips any trigram that already has a JSON file.
#
# Usage (from any directory):
#   bash tools/scripts/generate_all_word_lists.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TRIGRAMS_FILE="$PROJECT_ROOT/data/corpus/all_trigrams_4_to_15.txt"
WORD_LISTS_DIR="$PROJECT_ROOT/data/trigram-word-lists"

# Activate virtual environment
source "$PROJECT_ROOT/.venv/bin/activate"

# make_trigram_dict_json.py uses CWD-relative paths (../../data/...) so we must
# run it from a tools/* subdirectory — tools/scripts/ works identically to
# tools/automation/ since both are one level inside tools/.
cd "$SCRIPT_DIR"

TOTAL=$(grep -c '[A-Z]' "$TRIGRAMS_FILE")
COUNT=0
GENERATED=0
SKIPPED=0

echo "Generating word lists for $TOTAL trigrams…"
echo "Output → $WORD_LISTS_DIR"
echo "============================================"

while IFS= read -r TRIGRAM || [ -n "$TRIGRAM" ]; do
    [[ -z "$TRIGRAM" ]] && continue
    TRIGRAM_LOWER=$(echo "$TRIGRAM" | tr '[:upper:]' '[:lower:]')
    COUNT=$((COUNT + 1))

    if [ -f "$WORD_LISTS_DIR/${TRIGRAM_LOWER}_words.json" ]; then
        SKIPPED=$((SKIPPED + 1))
    else
        printf "[%4d/%d] Generating %s…\n" "$COUNT" "$TOTAL" "$TRIGRAM"
        python3 ../utils/make_trigram_dict_json.py "$TRIGRAM"
        GENERATED=$((GENERATED + 1))
    fi
done < "$TRIGRAMS_FILE"

echo "============================================"
printf "Done!  Generated: %d  |  Already existed: %d\n" "$GENERATED" "$SKIPPED"
