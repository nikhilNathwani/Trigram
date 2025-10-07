#!/bin/bash

# Central script to add a new trigram to the Trigram word game
# 
# This script handles the complete workflow:
# 1. Generate trigram word dictionary (via Python)
# 2. Update trigram_calendar.json (via Python) 
# 3. Commit and push changes to git (native bash)
#
# Usage: ./add_new_trigram.sh <TRIGRAM>

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

#########################################
#                                       #
# STEP 0: Validate Input & Setup        #
#                                       #
#########################################

# Check arguments
if [ $# -ne 1 ]; then
    echo -e "${RED}❌ No trigram provided.${NC}"
    echo "Usage: ./add_new_trigram.sh <TRIGRAM>"
    echo "Example: ./add_new_trigram.sh ABC"
    exit 1
fi

TRIGRAM=$1
TRIGRAM_UPPER=$(echo "$TRIGRAM" | tr '[:lower:]' '[:upper:]')
TRIGRAM_LOWER=$(echo "$TRIGRAM" | tr '[:upper:]' '[:lower:]')

# Validate trigram format
if [[ ! "$TRIGRAM" =~ ^[A-Za-z]{3}$ ]]; then
    echo -e "${RED}❌ Error: Trigram must be exactly 3 letters${NC}"
    exit 1
fi

echo -e "${BLUE}🎯 Starting automated trigram addition for: ${TRIGRAM_UPPER}${NC}"
echo "=================================================="

#########################################
#                                       #
# STEP 1: Generate Trigram Dictionary   #
#                                       #
#########################################
JSON_FILE="../data/trigram-word-lists/${TRIGRAM_LOWER}_words.json"
if [ -f "$JSON_FILE" ]; then
    echo -e "${YELLOW}📝 Dictionary already exists: ${TRIGRAM_UPPER}${NC}"
else
    echo -e "${YELLOW}📝 Generating word dictionary for trigram: ${TRIGRAM_UPPER}${NC}"
    python3 ../utils/make_trigram_dict_json.py "$TRIGRAM"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to generate trigram dictionary${NC}"
        exit 1
    fi
fi

# Ensure we're back in data-processing directory
cd "$(dirname "$0")"

#########################################
#                                       #
# STEP 2: Update Trigram Calendar       #
#                                       #
#########################################
echo -e "${YELLOW}📅 Updating trigram calendar with trigram: ${TRIGRAM_UPPER}${NC}"
python3 ../utils/update_calendar.py "$TRIGRAM"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to update trigram calendar${NC}"
    exit 1
fi

#########################################
#                                       #
# STEP 3: Generate Announcement Image   #
#                                       #
#########################################
cd ../social
IMAGE_FILE="../social/instagram_posts/trigram_announce_$(python3 -c "import sys; sys.path.append('../utils'); from calendar_utils import get_game_number_for_trigram; print(get_game_number_for_trigram('$TRIGRAM_UPPER', '../../data/trigram_calendar.json'))").png"
if [ -f "$IMAGE_FILE" ]; then
    echo -e "${YELLOW}🖼️  Image already exists: ${TRIGRAM_UPPER}${NC}"
else
    echo -e "${YELLOW}🖼️  Generating announcement image for trigram: ${TRIGRAM_UPPER}${NC}"
    python3 generate_image.py "$TRIGRAM"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to generate announcement image${NC}"
        exit 1
    fi
fi

cd ../automation

#########################################
#                                       #
# STEP 4: Git Operations                #
#                                       #
#########################################
echo -e "${YELLOW}🚀 Committing and pushing changes for trigram: ${TRIGRAM_UPPER}${NC}"

# Change to project root
cd ../..

# Calculate game number for the image filename using shared utility
GAME_NUMBER=$(python3 -c "
import sys
sys.path.append('tools/utils')
from calendar_utils import get_game_number_for_trigram
print(get_game_number_for_trigram('$TRIGRAM_UPPER', 'data/trigram_calendar.json'))
")

# Check if files exist
JSON_FILE="data/trigram-word-lists/${TRIGRAM_LOWER}_words.json"
CALENDAR_FILE="data/trigram_calendar.json"
IMAGE_FILE="tools/social/instagram_posts/trigram_announce_${GAME_NUMBER}.png"

if [ ! -f "$JSON_FILE" ]; then
    echo -e "${RED}❌ Error: $JSON_FILE not found${NC}"
    exit 1
fi

if [ ! -f "$CALENDAR_FILE" ]; then
    echo -e "${RED}❌ Error: $CALENDAR_FILE not found${NC}"
    exit 1
fi

# Note: Image file is generated but not added to git (excluded by .gitignore)

# Git add the files (skip image since it's in .gitignore)
echo -e "${BLUE}📁 Adding files: $JSON_FILE, $CALENDAR_FILE${NC}"
git add "$JSON_FILE" "$CALENDAR_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to add files to git${NC}"
    exit 1
fi

# Git commit
COMMIT_MSG="Add trigram ${TRIGRAM_UPPER}: generated word list and updated calendar"
echo -e "${BLUE}💾 Committing: $COMMIT_MSG${NC}"
git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to commit changes${NC}"
    exit 1
fi

# Git push
echo -e "${BLUE}🌐 Pushing to remote repository...${NC}"
git push

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push to remote repository${NC}"
    exit 1
fi

echo "=================================================="
echo -e "${GREEN}🎉 SUCCESS! Trigram ${TRIGRAM_UPPER} has been fully added and deployed!${NC}"
echo -e "${GREEN}📊 Dictionary: $JSON_FILE${NC}"
echo -e "${GREEN}📅 Calendar: Updated trigrams list${NC}"
echo -e "${GREEN}🖼️ Image: $IMAGE_FILE${NC}"
echo -e "${GREEN}🌐 Git: Committed and pushed to repository${NC}"