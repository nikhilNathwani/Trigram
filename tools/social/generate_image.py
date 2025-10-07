import os
import sys
from html2image import Html2Image
import platform

# Add utils to path for importing shared modules
sys.path.append('../utils')
from calendar_utils import get_game_number_for_trigram, get_formatted_game_date

def getGameNumberString(game_number):
    numStr = str(game_number)
    if len(numStr) <= 3:
        numStr = numStr.zfill(3)
    return numStr

def classify_letters(trigram: str):
    """
    Count how many letters are wide, medium, or narrow in a trigram.
    Assumes uppercase letters only.
    
    Wide: M, W
    Narrow: I, L
    Medium: all others
    """
    trigram = trigram.upper()  # ensure uppercase
    
    wide_letters = {"M", "W"}
    narrow_letters = {"I", "L"}
    
    counts = {"wide": 0, "medium": 0, "narrow": 0}
    
    for c in trigram:
        if c in wide_letters:
            counts["wide"] += 1
        elif c in narrow_letters:
            counts["narrow"] += 1
        else:
            counts["medium"] += 1
            
    return counts

    
def calculate_font_size(trigram, container_width, container_height,
                        padding_horizontal=36, padding_vertical=24,
                        border=12,
                        wide_width=0.88, medium_width=0.72, narrow_width=0.5,
                        space_width=0.33):
    """
    Calculate a font-size that allows a 3-letter trigram to fit horizontally and vertically in the container.

    Parameters:
    - trigram: str, the uppercase trigram
    - container_width/height: total box dimensions in px
    - padding_horizontal/vertical: px
    - border: px
    - wide_width/medium_width/narrow_width: width multipliers relative to font-size
    - space_width: width of &nbsp; between letters, relative to font-size
    """
    # Classify letters
    counts = classify_letters(trigram)
    
    # Effective inner width/height
    inner_width = container_width - 2*padding_horizontal - 2*border
    inner_height = container_height - 2*padding_vertical - 2*border
    
    # Total width multiplier (always 2 spaces for 3 letters)
    total_width_multiplier = (
        counts["wide"]*wide_width +
        counts["medium"]*medium_width +
        counts["narrow"]*narrow_width +
        2*space_width
    )
    
    # Font-size based on width
    font_size_width = inner_width / total_width_multiplier
    print(f"Font size based on width: {font_size_width}px")

    # Font-size based on height (capital letter height ≈ 70% of font-size)
    font_size_height = inner_height * 0.85
    print(f"Font size based on height: {font_size_height}px")   
    
    # Take the smaller one to fit both constraints
    font_size = min(font_size_width, font_size_height)
    font_size= round(font_size)
    print(f"Chosen font size: {font_size}px")
    return font_size


def load_template():
    # Load CSS and HTML
    with open("style.css", "r") as f:
        css = f.read()
    with open("template.html", "r") as f:
        body_html = f.read()

    # Construct full HTML with CSS inlined
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
{css}
</style>
</head>
<body>
{body_html}
</body>
</html>
"""
    return html

def make_trigram_image(trigram, game_number=1, output_file=None):
    # Calculate the date based on game number and start date
    formatted_date = get_formatted_game_date(game_number)

    # Load HTML template
    html = load_template()

    # Replace game number and date placeholders
    html = html.replace("{{GAME_NUMBER}}", f"Trigram #{getGameNumberString(game_number)}")
    html = html.replace("{{DATE}}", f"Week of {formatted_date}")

    # Calculate font-size for the trigram
    font_size_px = calculate_font_size(trigram, container_width=740, container_height=370)

    # Convert trigram to HTML with non-breaking spaces
    trigram_html = "&nbsp;".join(trigram.upper())

    # Replace placeholder in HTML with inline style for font-size
    html = html.replace(
        "{{TRIGRAM}}",
        f'<div style="font-size:{font_size_px:.1f}px;">{trigram_html}</div>'
    )

    # Default output filename
    if output_file is None:
        filename = f"trigram_announce_{game_number}.png"
        output_dir = "instagram_posts"
    else:
        if "/" in output_file:
            output_dir = os.path.dirname(output_file)
            filename = os.path.basename(output_file)
        else:
            output_dir = "."
            filename = output_file

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Render to PNG
    hti = Html2Image(output_path=output_dir)
    hti.screenshot(
        html_str=html,
        save_as=filename,
        size=(1080, 1080)  # Force square output
    )

    # Open the image automatically
    full_output_path = os.path.join(output_dir, filename)
    if platform.system() == "Darwin":       # macOS
        os.system(f"open {full_output_path}")
    elif platform.system() == "Windows":    # Windows
        os.startfile(full_output_path)
    else:                                   # Linux
        os.system(f"xdg-open {full_output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_image.py <trigram> [game_number]")
        print("  If game_number is not provided, it will be calculated from calendar.js")
        sys.exit(1)

    trigram = sys.argv[1]
    
    if len(sys.argv) >= 3:
        # Manual game number provided
        game_number = int(sys.argv[2])
    else:
        # Auto-calculate game number from calendar.js
        # Pass the correct relative path from img-generator to calendar.js
        game_number = get_game_number_for_trigram(trigram, "../../../../app/js/calendar.js")
        print(f"📊 Calculated game number {game_number} for trigram {trigram.upper()}")

    make_trigram_image(trigram, game_number)
