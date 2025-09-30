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
│   ├── dictionaries/           # Source word lists and dictionaries
│   │   ├── sowpods.txt         # Main word list
│   │   ├── sowpods_4.txt       # 4-letter words
│   │   ├── sowpods_5.txt       # 5-letter words
│   │   ├── ...                 # Other length-specific word lists
│   │   ├── word_frequency.txt  # Word frequency data
│   │   └── all_trigrams*.txt   # All possible trigrams
│   └── game-data/              # Generated data for each weekly trigram
│       ├── abc_words.json      # Words containing "abc"
│       ├── xyz_words.json      # Words containing "xyz"
│       └── ...                 # Other trigram-specific word lists
│
└── 🔧 tools/                   # PERIPHERAL TOOLS
    ├── utils/                  # Shared utilities
    │   └── read_word_list.py   # Word list reading functions
    ├── data-processing/        # Data pipeline scripts
    │   ├── build-corpus/       # Build word dictionaries
    │   │   ├── all_trigrams.py
    │   │   ├── sowpods_by_length.py
    │   │   └── ...
    │   └── generate-trigrams/  # Generate game data
    │       ├── make_trigram_dict_json.py
    │       ├── getWords.py
    │       └── ...
    └── content/                # Content generation
        └── social/             # Social media content
            └── img-generator/
```

## Data Flow

1. **Build Dictionaries**: `tools/data-processing/build-corpus/` creates word lists in `data/dictionaries/`
2. **Generate Game Data**: `tools/data-processing/generate-trigrams/` reads from `data/dictionaries/` and outputs JSON files to `data/game-data/`
3. **Game Uses Data**: `app/` reads from `data/game-data/` to power the game

## Usage

### Running the Game

Open `index.html` in a web browser. All game files are in the `app/` folder.

### Generating Data for New Trigrams

```bash
cd tools/data-processing/generate-trigrams/
python make_trigram_dict_json.py ABC
```

This creates `data/game-data/abc_words.json` with all words containing "ABC".

## Clear File Organization

-   **🎯 `app/`** - Everything for the web game (JS, CSS, assets)
-   **📊 `data/`** - Game data and word dictionaries
-   **🔧 `tools/`** - Scripts for data processing and content generation

## Development

The game is a Progressive Web App (PWA) that can be installed on mobile devices.
