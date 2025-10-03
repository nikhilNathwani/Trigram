# Trigram - A Weekly Word Game

A weekly word puzzle game using trigrams. Make words containing a 3-letter sequence.

## Project Structure

```
Trigram/
├── README.md                    # This file
├── index.html                   # Main game interface
├── site.webmanifest            # PWA manifest
│
├── 🎯 app/                     # WEB APPLICATION
│   ├── js/                     # Game logic
│   │   ├── game.js
│   │   ├── wordChecker.js
│   │   ├── storage.js
│   │   └── ...
│   ├── styles/                 # UI components and styles
│   │   ├── style.css
│   │   ├── view.js
│   │   ├── stats.js
│   │   └── modal.js
│   └── assets/                 # Static assets
│       ├── icons/
│       └── images/
│
├── 📊 data/                    # GAME DATA
│   ├── corpus/                 # Source word lists and corpora
│   │   ├── sowpods.txt         # Main word list
│   │   ├── sowpods_4.txt       # 4-letter words
│   │   ├── sowpods_5.txt       # 5-letter words
│   │   ├── ...                 # Other length-specific word lists
│   │   ├── word_frequency.txt  # Word frequency data
│   │   └── all_trigrams*.txt   # All possible trigrams
│   └── trigram-word-lists/     # Word lists for each trigram
│       ├── abc_words.json      # Words containing "abc"
│       ├── xyz_words.json      # Words containing "xyz"
│       └── ...                 # Other trigram-specific word lists
│
└── 🔧 tools/                   # PERIPHERAL TOOLS
    ├── automation/             # Trigram workflow tools
    │   ├── get_words.py        # Validate trigram words
    │   └── add_new_trigram.sh  # Add trigram to game
    ├── corpus/                 # Build word dictionaries
    │   ├── all_trigrams.py
    │   ├── all_trigrams_4_to_15.py
    │   └── sowpods_by_length.py
    ├── social/                 # Social media content generation
    │   ├── generate_image.py
    │   ├── template.html
    │   └── style.css
    ├── utils/                  # Shared utilities
    │   ├── calendar_utils.py
    │   ├── read_word_list.py
    │   ├── make_trigram_dict_json.py
    │   └── update_calendar.py
    └── deprecated/             # Archived files
```

## Data Flow

1. **Build Corpus**: `tools/corpus/` creates word lists in `data/corpus/`
2. **Generate Trigram Data**: `tools/utils/` reads from `data/corpus/` and outputs JSON files to `data/trigram-word-lists/`
3. **Game Uses Data**: `app/` reads from `data/trigram-word-lists/` to power the game

## Usage

### Running the Game

Open `index.html` in a web browser. All game files are in the `app/` folder.

### Generating Data for New Trigrams

```bash
cd tools/automation/
python get_words.py ABC    # Validate trigram has enough words
./add_new_trigram.sh ABC   # Add trigram to game (full workflow)
```

This creates `data/trigram-word-lists/abc_words.json` with all words containing "ABC".

## Clear File Organization

-   **🎯 `app/`** - Everything for the web game (JS, CSS, assets)
-   **📊 `data/`** - Game data and word corpora
-   **🔧 `tools/`** - Scripts for data processing and content generation

## Development

The game is a Progressive Web App (PWA) that can be installed on mobile devices.
