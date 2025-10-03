#!/usr/bin/env python3
"""
Script to update the trigrams list in calendar.js

Usage: python update_calendar.py <TRIGRAM>
"""

import sys
sys.path.append('.')
from calendar_utils import add_trigram_to_calendar

CALENDAR_JS_PATH = "../../app/js/calendar.js"

def update_calendar_trigrams(new_trigram):
    """Add a new trigram to the trigrams array in calendar.js"""
    return add_trigram_to_calendar(new_trigram, CALENDAR_JS_PATH)

def main():
    if len(sys.argv) != 2:
        print("❌ No trigram provided.")
        print("Usage: python update_calendar_trigrams.py <TRIGRAM>")
        return False
    
    trigram = sys.argv[1]
    
    # Validate trigram format
    if len(trigram) != 3 or not trigram.isalpha():
        print("❌ Error: Trigram must be exactly 3 letters")
        return False
    
    return update_calendar_trigrams(trigram)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)