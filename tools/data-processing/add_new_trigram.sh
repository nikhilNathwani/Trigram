#!/bin/bash

# Central script to add a new trigram to the Trigram word game
# 
# This script handles the complete workflow:
# 1. Generate trigram word dictionary (via Python)
# 2. Update calendar.js trigrams list (via Python) 
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
echo -e "${YELLOW}📝 Generating word dictionary for trigram: ${TRIGRAM_UPPER}${NC}"
cd generate-trigrams
python make_trigram_dict_json.py "$TRIGRAM"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate trigram dictionary${NC}"
    exit 1
fi
cd ..

#########################################
#                                       #
# STEP 2: Update Calendar.js            #
#                                       #
#########################################
echo -e "${YELLOW}📅 Updating calendar.js with trigram: ${TRIGRAM_UPPER}${NC}"
python update_calendar_trigrams.py "$TRIGRAM"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to update calendar.js${NC}"
    exit 1
fi

#########################################
#                                       #
# STEP 3: Generate Announcement Image   #
#                                       #
#########################################
echo -e "${YELLOW}🖼️  Generating announcement image for trigram: ${TRIGRAM_UPPER}${NC}"
cd ../content/social/img-generator
python generate_image.py "$TRIGRAM"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate announcement image${NC}"
    exit 1
fi
cd ../../data-processing

#########################################
#                                       #
# STEP 4: Git Operations                #
#                                       #
#########################################
echo -e "${YELLOW}🚀 Committing and pushing changes for trigram: ${TRIGRAM_UPPER}${NC}"

# Change to project root
cd ../..

# Calculate game number for the image filename using shared utility
GAME_NUMBER=$(python -c "
import sys
sys.path.append('../utils')
from calendar_utils import get_game_number_for_trigram
print(get_game_number_for_trigram('$TRIGRAM_UPPER', '../../app/js/calendar.js'))
")

# Check if files exist
JSON_FILE="data/game-data/${TRIGRAM_LOWER}_words.json"
CALENDAR_FILE="app/js/calendar.js"
IMAGE_FILE="tools/content/social/img-generator/trigram_announce_${GAME_NUMBER}.png"

if [ ! -f "$JSON_FILE" ]; then
    echo -e "${RED}❌ Error: $JSON_FILE not found${NC}"
    exit 1
fi

if [ ! -f "$CALENDAR_FILE" ]; then
    echo -e "${RED}❌ Error: $CALENDAR_FILE not found${NC}"
    exit 1
fi

if [ ! -f "$IMAGE_FILE" ]; then
    echo -e "${RED}❌ Error: $IMAGE_FILE not found${NC}"
    exit 1
fi

# Git add the files
echo -e "${BLUE}📁 Adding files: $JSON_FILE, $CALENDAR_FILE, $IMAGE_FILE${NC}"
git add "$JSON_FILE" "$CALENDAR_FILE" "$IMAGE_FILE"

# Git commit
COMMIT_MSG="Add trigram ${TRIGRAM_UPPER}: generated word list, updated calendar, and created announcement image"
echo -e "${BLUE}💾 Committing: $COMMIT_MSG${NC}"
git commit -m "$COMMIT_MSG"

# Git push
echo -e "${BLUE}🌐 Pushing to remote repository...${NC}"
git push

echo "=================================================="
echo -e "${GREEN}🎉 SUCCESS! Trigram ${TRIGRAM_UPPER} has been fully added and deployed!${NC}"
echo -e "${GREEN}📊 Dictionary: $JSON_FILE${NC}"
echo -e "${GREEN}📅 Calendar: Updated trigrams list${NC}"
echo -e "${GREEN}🖼️ Image: $IMAGE_FILE${NC}"
echo -e "${GREEN}🌐 Git: Committed and pushed to repository${NC}"