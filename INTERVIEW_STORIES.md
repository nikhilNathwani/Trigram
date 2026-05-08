# Trigram Project - Interview Stories

## Tailored for IBM Entry Level Software Developer Position

## 🏆 Story Rankings for IBM Interview

### Tier 1: Lead with These (Best Match for IBM's Requirements)

1. **Automated Weekly Workflow** ⭐⭐⭐⭐⭐
    - **Why:** Shows self-motivation, initiative, and practical scripting skills (Python + Bash)
    - **IBM Alignment:** Matches "scripting language" requirement, DevOps mindset, automation
    - **Demonstrates:** Initiative, process improvement, Python/Bash proficiency, Git workflow

2. **Alphabetical Sorting Bug** ⭐⭐⭐⭐⭐
    - **Why:** Perfect entry-level debugging story showing analytical problem-solving
    - **IBM Alignment:** Matches "strong analytical, debugging and problem-solving skills" requirement
    - **Demonstrates:** Systematic debugging, JavaScript proficiency, testing, learning from real users

### Tier 2: Strong Supporting Stories

3. **Nested CSS Bug** ⭐⭐⭐⭐
    - **Why:** Shows web development experience (HTML5, CSS3) and user-focused debugging
    - **IBM Alignment:** Matches "Web development" preference, cross-browser compatibility
    - **Demonstrates:** HTML5/CSS3 proficiency, debugging without reproduction, learning from users

4. **4-Step Event Pattern** ⭐⭐⭐
    - **Why:** Shows self-directed learning and structure in vanilla JS development
    - **IBM Alignment:** Demonstrates ability to learn and apply patterns independently
    - **Demonstrates:** Code organization, maintainability focus, self-imposed best practices

---

## 📖 Detailed Interview Stories

## Story 1: Automated Weekly Workflow (Python + Bash)

### **Expanded Story**

Trigram releases a new puzzle every week. Initially, the process was manual and took ~30 minutes:

1. Choose a trigram (e.g., "TOU")
2. Run Python script to extract words from corpus
3. Manually create JSON file
4. Update calendar.json with new trigram
5. Generate social media image
6. Git commit and push
7. Update Google Spreadsheet
8. Post to Instagram at midnight Sunday

I did this manually for ~10 weeks. Then I thought: "This is ridiculous—I'm a programmer."

I built a **fully automated pipeline**:

- `add_new_trigram.sh TOU` — one command does steps 1-6 automatically
- Bash orchestrates the workflow, Python handles data processing
- Script activates Python venv, generates word list, updates calendar, commits to git
- Color-coded output shows progress
- Error handling with `set -e` (exit on failure)

I even had to work around my keyboard automation tool (Karabiner) eating period characters typed by the script—added a workaround in the script.

### **STAR Format**

**Situation:** Releasing a new word puzzle weekly for Trigram required a 30-minute manual process: extract words from corpus, create JSON, update calendar, generate social media images, git commit, update spreadsheet. I did this manually for 10 weeks—it was tedious and error-prone.

**Task:** Automate the entire weekly release workflow to eliminate manual work, reduce errors, and free up time for feature development. Needed to orchestrate Python scripts, file I/O, git operations, and handle errors gracefully.

**Action:**

- Designed single-command interface: `./add_new_trigram.sh TOU`
- Built Bash orchestration script that:
    - Validates input (checks trigram format)
    - Activates Python virtual environment
    - Calls Python script (`get_words.py`) to extract words from SOWPODS corpus
    - Generates JSON file in `data/trigram-word-lists/`
    - Calls Python script to update `trigram_calendar.json`
    - Commits changes to git with descriptive message
    - Provides color-coded progress output (green ✓, yellow ⚠, red ❌)
- Added error handling: `set -e` to exit on any failure
- Discovered and fixed bug: keyboard automation tool (Karabiner) was eating period chars typed by script
- Created `WEEKLY-WORKFLOW.md` documentation with clear instructions
- Reduced manual steps from 6 to 1

**Result:** 30-minute process became a **10-second command**. Eliminated human errors (forgot to update calendar, typos in JSON). Freed up time to build features instead of doing data entry. Documented the workflow so future contributors could use it. This demonstrates **self-motivation to achieve goals** and **innovation in product engineering**—key IBM values. Shows I think beyond just coding features to improving the entire development workflow. Used version control (Git) throughout, aligning with IBM's GitHub proficiency requirement.

### **Maps to These Interview Questions:**

- ✅ "Tell me about a time you automated a manual process"
- ✅ "Describe your approach to developer productivity"
- ✅ "How do you identify and eliminate inefficiencies?"
- ✅ "Tell me about a time you took initiative"
- ✅ "Describe your experience with scripting/automation"
- ✅ "How do you approach tooling and infrastructure?"
- ✅ "Tell me about a time you improved a workflow"

---

## Story 3: The Alphabetical Sorting Bug

### **Expanded Story**

After shipping Trigram, I had a few dedicated users playing daily. Around week 10, I got a bug report: "My streak counter reset even though I've been playing every day!" I checked the logs—the user had genuinely played all 10 games consecutively.

The issue was subtle: localStorage keys are stored as strings ("1", "2", ..., "10", "11"), and JavaScript's default `.sort()` sorts lexicographically. This meant game IDs were ordered: `["1", "10", "11", "2", "3", ...]`. When calculating streaks, the algorithm checked for consecutive game IDs, so it saw "1" followed by "10" and broke the streak.

The bug was silent—no errors, no crashes—just wrong calculations that only appeared after 10+ plays. I added test data simulating 15 games, confirmed the bug, and fixed it by converting keys to integers before sorting. I also audited the entire codebase for similar assumptions and added comments warning future-me about localStorage's string storage.

### **STAR Format**

**Situation:** Users reported streak counters incorrectly resetting after 10+ days of consecutive play in my word game. No error messages appeared, and the bug didn't manifest in my testing (I'd only tested with <10 games).

**Task:** Debug a silent data corruption issue affecting long-term users, identify the root cause, fix it without losing existing user data, and prevent similar issues.

**Action:**

- Created test data with 15 simulated games in localStorage to reproduce the issue
- Used console logging to trace the streak calculation algorithm step-by-step
- Discovered JavaScript's `.sort()` was sorting ["1", "10", "11", "2"] alphabetically
- Refactored: `Object.keys(localStorage).map(k => parseInt(k, 10)).sort((a,b) => a-b)`
- Added inline comments documenting the integer conversion requirement
- Audited the entire codebase for similar string-vs-number assumptions
- Tested with 20+ simulated games to verify the fix

**Result:** Fixed the bug without breaking existing user data. Users regained their correct streaks retroactively (since the data was intact, just sorted wrong). This taught me valuable lessons about **testing at scale** and being explicit about data types in JavaScript's loosely-typed environment. Added a `test.js` file with streak calculation tests to catch regressions, showing I learned to prevent similar issues proactively. The experience demonstrates the **strong analytical and debugging skills** IBM values, plus the ability to learn from real-world issues.

**Technical Detail (if asked):**

```javascript
// Before (broken)
const keys = Object.keys(localStorage).sort();
// Result: ["1", "10", "11", "2", "3", "4", ...]

// After (fixed)
const keys = Object.keys(localStorage)
	.map((key) => parseInt(key, 10)) // Convert to ints
	.sort((a, b) => a - b); // Numeric sort
// Result: [1, 2, 3, 4, ..., 10, 11, ...]
```

### **Maps to These Interview Questions:**

- ✅ "Tell me about a time you debugged a challenging issue"
- ✅ "Describe a bug that only appeared in production"
- ✅ "How do you approach testing and quality assurance?"
- ✅ "Tell me about a time you learned from a mistake"
- ✅ "Describe your debugging process"

---

## Story 3: 4-Step Event Pattern Architecture

### **Expanded Story**

Building Trigram in vanilla JavaScript (no React/Vue), I needed structure to prevent spaghetti code. After the first few game actions became messy (state updates mixed with UI calls mixed with game logic), I imposed a **consistent 4-step pattern** on every game event:

```javascript
function gameAction() {
	// 1. Confirm action can be performed (validation/guard clauses)
	// 2. Perform the action (state mutations)
	// 3. Inform the UI (view updates via UI_STATE methods)
	// 4. Advance the game (trigger next action if needed)
}
```

This made the codebase **predictable**: anyone reading `addLetter()`, `deleteLetter()`, `submitGuess()`, or `handleValidGuess()` would find the same structure. It also made debugging trivial—I could add console logs at each step boundary.

The pattern enforced **separation of concerns**: game logic (game.js) stayed separate from presentation (view.js). It was essentially a hand-rolled MVC pattern, and it prepared me for framework concepts later.

### **STAR Format**

**Situation:** Building a word game in vanilla JavaScript without frameworks. Early code was becoming messy—game state updates, UI calls, and business logic were intermingled, making the codebase hard to follow and debug.

**Task:** Create architectural structure to keep code organized, maintainable, and debuggable without introducing a framework, while working solo on the project.

**Action:**

- Analyzed existing functions and identified common phases: validation → state change → UI update → next action
- Designed a **4-step pattern** enforced via comments in every game action:
    1. **Confirm action can be performed** (validation, guard clauses, early returns)
    2. **Perform the action** (mutate game state, call external APIs)
    3. **Inform the UI** (call `UI_STATE.*` methods to update view)
    4. **Advance the game** (trigger next action if needed, e.g., `submitGuess()`)
- Applied pattern consistently to all 8 game actions (startGame, startLevel, addLetter, etc.)
- Added structured comments in code to make steps explicit and self-documenting
- Enforced separation: game.js handles state, view.js handles DOM, never mixed

**Result:** Codebase became highly readable and maintainable. New features fit naturally into the pattern. Debugging became easier—console log at each step boundary. The pattern taught me **MVC principles from first principles**, which I later recognized in frameworks like React—demonstrating my **continuous learning** approach. Using Git for all changes aligned with **source control management** best practices IBM requires. This self-directed learning shows I can pick up patterns and practices independently, preparing me to learn IBM's specific frameworks and practices quickly.

**Code Example (if asked):**

```javascript
function addLetter(letter) {
    // 1. Confirm action can be performed
    var nextLetterPosition = GAME_STATE.lettersProvided[...].length;
    if (nextLetterPosition >= GAME_STATE.wordLength_current) {
        submitGuess();
        return;
    }

    // 2. Perform the action
    GAME_STATE.lettersProvided[GAME_STATE.wordLength_current] += letter;

    // 3. Inform the UI
    UI_STATE.addLetter(letter);

    // 4. Advance the game
    if (nextLetterPosition + 1 >= GAME_STATE.wordLength_current) {
        submitGuess();
    }
}
```

### **Maps to These Interview Questions:**

- ✅ "How do you approach software architecture?"
- ✅ "Describe a time you improved code organization"
- ✅ "How do you write maintainable code?"
- ✅ "Tell me about architectural patterns you've used"
- ✅ "How do you design systems without frameworks?"
- ✅ "Describe your approach to separation of concerns"

---

## Story 4: Nested CSS Bug (Browser Compatibility)

### **Expanded Story**

A user reported that Trigram looked completely broken on their iPhone 7 running older Safari/Edge—borders were missing, hover states didn't work, and the UI was unusable. I didn't have an iPhone 7, so I couldn't reproduce it locally.

I reviewed my CSS and realized I'd used **CSS nesting** (`.active { .letter { ... } }`), a modern feature that wasn't universally supported yet. The code worked on my Mac and modern phones but silently failed on older browsers—no errors, just ignored rules.

The fix was mechanical but tedious: flatten all nested selectors (`.active .letter { ... }`). But the _discovery_ was the challenge—I had to reason about what CSS features might not be supported, hypothesis-test by looking at my code, and validate without the device. I commented the old code and new code to document why I'd "downgraded" the syntax.

This taught me about **progressive enhancement** and **testing on real devices**—or at least browser compatibility tools like BrowserStack.

### **STAR Format**

**Situation:** A user reported Trigram was completely unusable on their iPhone 7 with older Safari browser—UI elements had no styling, hover states didn't work. I couldn't reproduce it on my devices (Mac, modern iPhone).

**Task:** Debug a CSS issue I couldn't reproduce locally, identify browser compatibility problems without access to the device, and fix it while maintaining code quality.

**Action:**

- Asked user for browser/OS details: iPhone 7, older Safari/Edge
- Researched CSS features I'd used and their browser support on caniuse.com
- Identified **CSS nesting** (`.active { .letter { ... } }`) as likely culprit—not widely supported until ~2023
- Refactored all nested CSS rules to flat selectors (`.active .letter { ... }`)
- Added comments documenting why: `/* Replacing nested rules since they seem unsupported in some environments */`
- Kept old code as commented-out examples for context
- Asked user to test—confirmed fix worked

**Result:** User confirmed the site worked perfectly after the fix. This was a formative learning experience about progressive enhancement and browser compatibility—critical for **web development** in enterprise environments. Now I check caniuse.com before using modern CSS features and understand the importance of testing across environments. The incident taught me that "works on my machine" isn't enough—I need to consider the full user ecosystem. This aligns with IBM's focus on building software that works reliably for diverse users across different systems.

**Technical Detail (if asked):**

```css
/* Before (broken on iPhone 7) */
.active {
	.letter {
		border-width: 3px;
	}
}

/* After (works everywhere) */
.active .letter {
	border-width: 3px;
}
```

### **Maps to These Interview Questions:**

- ✅ "Tell me about a time you had to debug without being able to reproduce an issue"
- ✅ "How do you ensure cross-browser compatibility?"
- ✅ "Describe a situation where you had to work with constraints"
- ✅ "Tell me about a time you learned about accessibility/compatibility"
- ✅ "How do you handle user-reported bugs?"
- ✅ "Describe your approach to testing"

---

## Interview Tips

### Opening Framework for IBM Interview

When asked "Tell me about a project you're proud of":

> "I built Trigram, a daily word puzzle game that's been played by hundreds of users. Over 10 months and 377 commits, I learned JavaScript, HTML5, CSS3, Python, and Bash while shipping a real product. Working with actual users taught me debugging, testing, and iteration—skills that translate directly to IBM's collaborative development environment. Let me share a specific challenge..."

### Story Selection Strategy for IBM Entry-Level Role

**Best Approach:** Lead with **Automated Workflow** or **Alphabetical Sorting Bug**

- Both show self-motivation, problem-solving, and learning mindset
- Both use IBM's preferred technologies (Python/JavaScript)
- Both demonstrate practical, results-oriented thinking

**If they ask about collaboration:** Emphasize how you gathered user feedback, iterated based on real-world usage, and documented your work for future maintainability

**If they ask about learning:** Talk about teaching yourself vanilla JavaScript, then learning to appreciate what frameworks solve—shows you'll adapt quickly to IBM's tech stack

---

## 🎯 Why IBM? (Connecting Trigram to IBM Culture)

**What to emphasize:**

- "Trigram taught me JavaScript fundamentals and web development from scratch—I'm excited to apply this foundation to enterprise-scale applications at IBM"
- "Building automation for weekly releases showed me the value of process improvement—I'm eager to bring this mindset to IBM's DevOps culture"
- "Working with real users taught me the importance of testing across environments and listening to feedback—skills crucial for IBM's diverse client base"
- "Self-directing my learning on Trigram (JavaScript, HTML5, CSS3, Python, Bash) demonstrates I can quickly adapt to new technologies at IBM"
- "The 4-step event pattern taught me that structure matters even without frameworks—I'm ready to learn IBM's architectural patterns and best practices"

---

## Stories Summary

- **Tier 1 (2 stories):** Automated Weekly Workflow, Alphabetical Sorting Bug
- **Tier 2 (2 stories):** Nested CSS Bug, 4-Step Event Pattern
- **Total: 4 stories**

**Key Themes:** Self-directed learning, automation, debugging, architectural thinking, cross-browser compatibility

**Remember:** These stories demonstrate you have:

- ✅ **Required:** JavaScript, Python, GitHub, HTML5/CSS3, Debugging, Problem-solving, Self-motivation
- ✅ **Preferred:** Web development, Scripting (Python/Bash), Testing across environments
- ✅ **Culture Fit:** Continuous learning, initiative, user focus, process improvement

You're positioning as a **self-taught developer with strong fundamentals**, real-world experience, and a **growth mindset**—perfect for IBM's entry-level role where learning and adaptability matter most.
