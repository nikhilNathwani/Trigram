#!/usr/bin/env python3
"""
Utility functions for working with the trigrams calendar.
"""

import json
import os
from datetime import datetime, timedelta

# Game start date constant
GAME_START_DATE = datetime(2024, 4, 15)

def get_game_number_for_trigram(trigram, calendar_path=None):
    """
    Calculate game number based on trigram position in trigram_calendar.json
    
    Args:
        trigram: The trigram to find (e.g., "ABC")
        calendar_path: Optional path to trigram_calendar.json. If None, uses default relative path.
        
    Returns:
        int: Game number (1-indexed position in trigrams array)
    """
    # Get all trigrams and find the position
    trigrams = get_trigram_calendar(calendar_path)
    if not trigrams:
        return 1
    
    try:
        position = trigrams.index(trigram.upper()) + 1
        return position
    except ValueError:
        print(f"Warning: Trigram {trigram.upper()} not found in trigram_calendar.json, using game number 1")
        return 1

def get_trigram_calendar(calendar_path=None):
    """
    Get the trigram calendar from the trigram_calendar.json file
    
    Args:
        calendar_path: Optional path to trigram_calendar.json. If None, uses default relative path.
        
    Returns:
        list: List of trigrams in weekly game order
    """
    # Set default path if none provided
    if calendar_path is None:
        calendar_path = "../../data/trigram_calendar.json"
    
    try:
        with open(calendar_path, 'r') as f:
            trigrams = json.load(f)
            print(f"Loaded {len(trigrams)} trigrams from {calendar_path}")  
        return trigrams
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading trigram calendar from {calendar_path}: {e}")
        return []
    
    # Extract the trigrams array section
    array_section = content[trigrams_start:closing_bracket]
    
    # Find all trigrams in quotes
    trigram_matches = re.findall(r'"([A-Z]{3})"', array_section)
    return trigram_matches

def get_current_trigram(calendar_path=None):
    """
    Get the current trigram based on current date logic (if implemented)
    For now, returns the last trigram in the list
    
    Args:
        calendar_path: Optional path to calendar.js
        
    Returns:
        str: Current trigram, or None if not found
    """
    trigrams = get_trigram_calendar(calendar_path)
    if trigrams:
        return trigrams[-1]  # Return the most recently added trigram
    return None

def get_game_date(game_number):
    """
    Calculate the date for a given game number based on the game start date
    
    Args:
        game_number: The game number (1-indexed)
        
    Returns:
        datetime: The date for that game week
    """
    weeks_to_add = game_number - 1  # Game 1 = 0 weeks added, Game 2 = 1 week added, etc.
    return GAME_START_DATE + timedelta(weeks=weeks_to_add)

def get_formatted_game_date(game_number, format_string="%B %d, %Y"):
    """
    Get a formatted date string for a given game number
    
    Args:
        game_number: The game number (1-indexed)
        format_string: Python datetime format string (default: "Month DD, YYYY")
        
    Returns:
        str: Formatted date string
    """
    game_date = get_game_date(game_number)
    return game_date.strftime(format_string)

def add_trigram_to_calendar(new_trigram, calendar_path=None):
    """
    Add a new trigram to the trigrams array in trigram_calendar.json
    
    Args:
        new_trigram: The trigram to add (e.g., "ABC")
        calendar_path: Optional path to trigram_calendar.json
        
    Returns:
        bool: True if successful, False otherwise
    """
    if calendar_path is None:
        calendar_path = "../../data/trigram_calendar.json"
    
    # Load existing trigrams
    trigrams = get_trigram_calendar(calendar_path)
    
    # Check if trigram already exists
    if new_trigram.upper() in trigrams:
        print(f"⚠️  Trigram {new_trigram.upper()} already exists in trigram_calendar.json")
        return True  # Return True since the trigram is in the calendar (goal achieved)
    
    # Add new trigram to the end
    trigrams.append(new_trigram.upper())
    
    # Save the updated file
    try:
        with open(calendar_path, 'w') as file:
            json.dump(trigrams, file, indent=1)
        
        print(f"✅ Added {new_trigram.upper()} to trigrams list in trigram_calendar.json")
        return True
    except Exception as e:
        print(f"❌ Error saving trigram_calendar.json: {e}")
        return False