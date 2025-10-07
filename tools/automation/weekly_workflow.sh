#!/bin/bash

# =============================================================================
# Trigram Weekly Workflow Automation Script
# 
# This script automates the complete setup for weekly trigram publication:
# - Opens VS Code with workflow files
# - Opens 2 Terminal windows with commands ready to run
# - Opens Chrome with spreadsheet and Instagram
# - Auto-scrolls Instagram to see latest posts
# =============================================================================

# -----------------------------------------------------------------------------
# STEP 1: Open VS Code Files
# -----------------------------------------------------------------------------
# Open project workspace
/usr/local/bin/code "/Users/nikhilnathwani/Documents/Projects/Trigram"
sleep 1

# Open automation script for editing
/usr/local/bin/code --reuse-window "/Users/nikhilnathwani/Documents/Projects/Trigram/tools/automation/add_new_trigram.sh"
sleep 0.5

# Open workflow documentation
/usr/local/bin/code --reuse-window "/Users/nikhilnathwani/Documents/Projects/Trigram/WEEKLY-WORKFLOW.md"
sleep 1

# -----------------------------------------------------------------------------
# STEP 2: Setup Terminal Windows
# -----------------------------------------------------------------------------
osascript <<EOF > /dev/null
# Check if Terminal app is already running
set terminalWasRunning to false
tell application "System Events"
    if (name of processes) contains "Terminal" then
        set terminalWasRunning to true
    end if
end tell

tell application "Terminal"
    activate
    
    if terminalWasRunning then
        # Terminal already running: Create 2 fresh windows to preserve existing work
        
        # Window 1: Upload script (add_new_trigram.sh)
        do script "cd '/Users/nikhilnathwani/Documents/Projects/Trigram/tools/automation'"
        delay 1
        tell application "System Events"
            tell process "Terminal"
                keystroke "./add_new_trigram.sh "
            end tell
        end tell
        
        delay 1
        
        # Window 2: Word finder script (get_words.py)
        do script "cd '/Users/nikhilnathwani/Documents/Projects/Trigram/tools/automation'"
        delay 1
        tell application "System Events"
            keystroke "python3 get_words.py "
        end tell
    else
        # Terminal not running: Use auto-launched window + create 1 more
        
        # Use the auto-launched window for upload script
        do script "cd '/Users/nikhilnathwani/Documents/Projects/Trigram/tools/automation'" in window 1
        delay 1
        tell application "System Events"
            tell process "Terminal"
                keystroke "./add_new_trigram.sh "
            end tell
        end tell
        
        delay 1
        
        # Create new window for word finder script
        do script "cd '/Users/nikhilnathwani/Documents/Projects/Trigram/tools/automation'"
        delay 1
        tell application "System Events"
            keystroke "python3 get_words.py "
        end tell
    end if
end tell
EOF
sleep 0.5

# -----------------------------------------------------------------------------
# STEP 3: Open Web Resources
# -----------------------------------------------------------------------------
# Open trigram tracking spreadsheet (background window)
open -na "Google Chrome" --args --new-window \
 "https://docs.google.com/spreadsheets/d/1_GHU8MLunmLTphSwR-xF5q89bxt-r4IQ/edit?gid=2105180696#gid=2105180696"
sleep 2

# Open Instagram page (foreground window)
open -na "Google Chrome" --args --new-window \
"https://www.instagram.com/playtrigram/"
sleep 1.5

# Auto-scroll Instagram to see recent posts
osascript <<EOF > /dev/null
tell application "Google Chrome"
    activate
    # Focus on Instagram tab
    tell front window
        set active tab index to 1
    end tell
    delay 0.5
    
    # Scroll down using arrow keys (more reliable than JavaScript)
    tell application "System Events"
        tell process "Google Chrome"
            repeat 12 times
                key code 125 -- down arrow key
                delay 0.1
            end repeat
        end tell
    end tell
end tell
EOF
