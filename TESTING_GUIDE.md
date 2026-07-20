# A Guide to JS Testing, Taught Through This Codebase

This doc teaches JavaScript testing from first principles, using the actual
test suite in `tests/` as the running example. Every concept below points at
real code you can open and read. It's meant to be read roughly in order.

---

## 1. Why bother testing at all?

Before this test suite existed, verifying that a code change didn't break
anything meant manually clicking through the app in a browser. That's what
happened earlier in this project's history: a refactor to `game.js` was
verified by hand-driving a headless browser once, checking the output, and
moving on. That verification was real, but it was also thrown away the
moment it finished — the next change would need the same manual process
repeated from scratch, by whoever happened to be making it.

A test suite is that same verification, **saved and made repeatable**. Every
test in `tests/unit/` and `tests/e2e/` is a small, permanent script that
asks "does the app still behave the way we already decided it should?" —
and it can ask that question in under 10 seconds, forever, for free, without
anyone needing to remember what to check by hand.

That's the entire pitch. Everything else in this doc is about *how*.

---

## 2. The testing pyramid: unit, integration, E2E

Tests differ along one big axis: **how much of the real system is actually
running underneath the test?** This project has tests at three different
points along that axis:

| Layer | What's real | What's faked | Example in this repo | Speed |
|---|---|---|---|---|
| **Unit** | One function | Everything it talks to | `tests/unit/wordChecker.test.js` — tests `validateWord()` alone | ~1ms/test |
| **Integration** | Several real functions cooperating | The outside world (network, browser chrome) | `tests/unit/stats.test.js`'s `calcWinPercentage (via loadStats)` block — `loadPastGames()` + `loadStats()` + `calcWinPercentage()` all run for real together | ~1ms/test |
| **E2E** (end-to-end) | The whole app: real browser, real DOM, real localStorage, real static file server | Only "a real user's mouse/keyboard," which Playwright simulates | `tests/e2e/gameplay.spec.js` | ~1-6s/test |

The shape is a **pyramid** on purpose: lots of cheap unit tests at the
bottom, fewer integration tests in the middle, and a handful of expensive
E2E tests at the top. Unit tests are cheap enough to write dozens of and run
constantly; E2E tests are slow and comparatively fragile (a browser has to
actually launch), so you reserve them for the handful of flows worth
verifying "for real" — the golden paths a real user takes.

This project currently has 42 unit tests (~0.7s total) and 5 E2E tests
(~8s total). That ratio is not an accident — it's the pyramid working as
intended.

### Is "E2E" the same thing as "integration testing"?

**Related, but not synonymous** — and this is a genuinely confusing corner
of testing terminology, so it's worth being precise about it.

- **Integration test** is the broad, general term for "a test that
  exercises more than one unit working together, instead of one unit in
  isolation." That's it. It says nothing about *how* — no requirement that
  a browser, a UI, or a network is involved.
- **E2E test** is a specific *kind* of integration test: one that drives
  the system through its real, outermost entry point — for a web app,
  that's an actual browser clicking actual buttons — and follows the
  request all the way through to a real, observable, user-facing result.

So: **every E2E test is an integration test, but not every integration test
is E2E.** The `calcWinPercentage (via loadStats)` tests in
`tests/unit/stats.test.js` are integration tests by the broad definition —
three real functions cooperate — but they're not E2E, because nothing about
them touches a browser, a click, or a URL. They still run inside Vitest's
fast in-Node jsdom sandbox. `tests/e2e/gameplay.spec.js`, by contrast, is
both: it's integration testing (many real pieces cooperating) *and* E2E
(via a real Chromium browser hitting a real local web server).

If you hear someone use "integration test" to mean what this doc calls E2E,
that's common — the industry hasn't fully standardized this vocabulary.
When it matters, ask "does this spin up a real browser?" — that's the
question that actually predicts speed, flakiness risk, and what the test
can catch.

---

## 3. Anatomy of a test file

Every test file in this project (unit or E2E) follows the same skeleton,
borrowed from a decades-old JS testing convention:

```js
describe("wordChecker", () => {          // groups related tests
  describe("validateWord", () => {       // can nest, for sub-groups
    it("returns [true, ''] for a fully valid guess", () => {  // one test
      expect(validateWord("CATS", "CAT", 4, fixtureWordList)).toEqual([true, ""]);
    });
  });
});
```
(from `tests/unit/wordChecker.test.js`)

- **`describe`** is just a label for organizing output — it has no
  behavior of its own, it just groups `it` blocks so failures are easy to
  locate (`wordChecker > validateWord > returns [true, ''] ...`).
- **`it`** (an alias for `test`) is one individual test case: one specific
  claim about the code, in plain English, followed by code that checks it.
- **`expect(...).toEqual(...)`** is an **assertion** — a statement that
  either holds (test passes) or doesn't (test fails, and you're told
  exactly what was expected vs. what actually happened). `toEqual`,
  `toBe`, `toHaveClass`, `toHaveBeenCalledWith` are all **matchers** — the
  vocabulary of things you can assert.

### The Arrange-Act-Assert pattern

Nearly every test, in any language, breaks into three parts. Look at this
one from `tests/unit/wordChecker.test.js`:

```js
it("returns NOT-FOUND for a word that is the right shape but not in the dictionary", () => {
  expect(validateWord("CATE", "CAT", 4, fixtureWordList)).toEqual([false, "NOT-FOUND"]);
});
```

Here it's compressed onto one line, but it's still:
- **Arrange** — set up the situation (`fixtureWordList`, a plain object
  literal declared once near the top of the file, that doesn't contain
  "CATE")
- **Act** — do the thing being tested (`validateWord("CATE", "CAT", 4, fixtureWordList)`)
- **Assert** — check the result (`.toEqual(...)`)

A slightly more spread-out example, from `tests/unit/storage.test.js`:

```js
it("returns the saved state after saveGameState has been called", () => {
  // Arrange + Act: put the game into a known state
  saveGameState({
    trigram: "CAT",
    lettersProvided: [null, null, null, null, "CATS"],
  });

  // Assert: check what comes back out
  expect(loadGameState()).toEqual({
    trigram: "CAT",
    wordsProvided: [null, null, null, null, "CATS"],
  });
});
```

If you're ever unsure how to structure a new test, write those three
comments first and fill in the code under each.

---

## 4. Why we started with `wordChecker.js`

`tests/unit/wordChecker.test.js` was the first file written, and it's the
best entry point for learning unit testing, because `validateWord()` and
its helpers (`isWordLengthReached`, `containsTrigram`, `existsInWordList`)
are **pure functions**: given the same inputs, they always produce the
same output, and they don't reach out to the DOM, the network, or global
mutable state to do it. (This wasn't always true — §7 is a case study in
how a testing pain point led to making these functions fully pure.)

Pure functions are the easiest thing in any codebase to test, because a
test for them is just: *call it, check what came back.* No setup, no
browser, no waiting. That's why the unit-testing layer of the pyramid is
so cheap — most of what belongs there is exactly this shape.

Contrast that with something like `UI_STATE.startLevel()` in
`app/js/ui/view.js`, which reads and mutates shared state, queries the
DOM, and triggers CSS animations. That function is real and important, but
it's a much worse candidate for a unit test — there's no "just call it and
check the return value," because its entire job is side effects. That's
why it's covered by the E2E layer instead (§6), not a unit test.

**Rule of thumb:** if a function's job is "compute an answer from its
arguments," unit-test it directly. If its job is "make something happen"
(render UI, save to storage, fire an event), test it either through the
public functions that observably change (like `storage.test.js` does for
`saveGameState`/`loadGameState`) or through a real E2E flow.

---

## 5. Controlling the pieces that would otherwise make tests flaky

A test that sometimes passes and sometimes fails for no code-related reason
is called **flaky**, and flaky tests are worse than no tests — they teach
people to ignore red test results. The two most common sources of flakiness
are **time** and **the network**, and this project's tests deal with both.

### Faking time: `tests/unit/calendar.test.js`

`getGameID()` in `app/js/calendar.js` looks at `new Date()` — "right now."
A test that just calls `getGameID()` and checks the result would pass or
fail *depending on what day you run it*, which is useless. Instead:

```js
vi.useFakeTimers();
vi.setSystemTime(new Date("2024-04-15T00:00:00Z"));
expect(getGameID()).toBe(0);
```

`vi.setSystemTime` freezes "now" to an exact instant, so `new Date()`
inside `getGameID()` always sees that same instant, no matter when or where
the test actually runs. This turns a nondeterministic function into a
deterministic one for testing purposes — same idea as pure functions in
§4, just achieved by controlling an *input* the function doesn't take as a
literal argument.

There's a second, subtler timing trap this project also had to handle:
`getGameID()` calls `.getTimezoneOffset()`, so the "same" test could give
different answers on a machine in Tokyo vs. one in New York. The fix is in
`vitest.config.js`:

```js
env: { TZ: "UTC" },
```

This pins every test run to the UTC timezone, so date math is identical on
every machine that ever runs these tests — including CI servers, which
default to UTC anyway. Without this, the calendar tests would be flaky
across contributors' machines even though the *code* never changed.

### Faking the network: `tests/unit/wordChecker.test.js`

`loadWordList()` calls the real `fetch()`, which would try to make a real
HTTP request during a test — slow, and dependent on a server actually
running. It's the one function in `wordChecker.js` with a real side effect
(everything else — `validateWord`, `existsInWordList`, etc. — is now a
pure function that just takes a word list as an argument; see §7). So it's
also the only place in this file that needs `fetch` mocked:

```js
vi.stubGlobal(
  "fetch",
  vi.fn().mockResolvedValue({
    json: () => Promise.resolve(fixtureWordList),
  })
);

await expect(loadWordList("cat")).resolves.toEqual(fixtureWordList);
```

`vi.stubGlobal("fetch", ...)` replaces the real `fetch` function with a
**mock** — a fake stand-in that returns canned data instantly instead of
making a real network call. This is called **mocking**, and it's how unit
tests stay fast and offline-proof: anything that would touch the outside
world gets replaced with a predictable fake for the duration of the test.

The same file also mocks a *rejected* fetch, to test the failure path —
worth doing for any function that has a `catch`, since that branch never
runs during normal happy-path testing otherwise:

```js
vi.stubGlobal("fetch", vi.fn().mockRejectedValue(networkError));
await expect(loadWordList("cat")).rejects.toBe(networkError);
```

A closely related tool is **spying**, used in the same file to check that
an error was actually logged without letting the real `console.error`
clutter the test output:

```js
const spy = vi.spyOn(console, "error").mockImplementation(() => {});
expect(existsInWordList("CATS", 4, null)).toBe(false);
expect(spy).toHaveBeenCalledWith("Word list not loaded.");
```

The difference: a **mock** replaces a function's behavior entirely (fake
`fetch` returns fake data); a **spy** wraps a *real* function so you can
observe how it was called, while optionally also suppressing/replacing
what it does (here, we suppress the console output but still assert it
would have fired, and with what message).

### Not faking the network: `tests/unit/storage.test.js`

Contrast the above with `storage.js`, whose tests use the *real*
`localStorage`:

```js
beforeEach(() => {
  localStorage.clear();
});
```

There's no mock here — jsdom (the fake-browser environment Vitest runs
these tests in, see `vitest.config.js`'s `environment: "jsdom"`) ships a
real, working, in-memory implementation of `localStorage`. So instead of
mocking it, the tests just use it directly and clean up after themselves
with `localStorage.clear()` in `beforeEach`.

This is a judgment call worth noticing: **mock what's slow, external, or
unpredictable (network); use the real thing when a fast, accurate fake
implementation is already available (localStorage via jsdom).** Mocking
everything indiscriminately makes tests fast but increasingly disconnected
from reality — the goal is realism wherever realism is cheap.

---

## 6. E2E tests: `tests/e2e/gameplay.spec.js`

Unit tests each check one function. E2E tests check that the *whole app*,
wired together, does what a player experiences. This project uses
**Playwright** to launch a real (headless) Chromium browser, navigate it to
the real `index.html`, and drive it with real keyboard input.

```js
await page.goto("/index.html");
await page.waitForFunction(
  () => document.querySelectorAll(".header-element #trigram span").length > 0,
  { timeout: 10_000 }
);
await page.click("#playButton");
await page.click("#helpScreen .closeButton");
```
(from `tests/e2e/helpers.js`)

`playwright.config.js` boots a real static file server (`http-server`) that
serves this repo exactly the way Netlify does in production, after first
running `npm run build` (see §8 — `app/js` is bundled before the app can run
at all now). No shortcuts, no test-only code paths. If a test passes, it's
because the actual production files behaved correctly in an actual browser.

### The flakiness bug this doc's author actually hit (and how it was fixed)

Early drafts of these E2E tests used a fixed delay to wait for a screen
transition to finish:

```js
await page.waitForTimeout(4500); // guessed 4.5 seconds — WRONG
```

This intermittently failed, because the CSS animation it was waiting on
(`#trigramRevealScreen.showTemporarily` in `app/css/screens.css`) actually
takes **5 seconds**. The guessed delay was too short, so the test's next
keystrokes landed while the app was still ignoring input — not because the
app was broken, but because the *test* was racing against an animation and
occasionally losing.

The fix, now in `tests/e2e/helpers.js`, is the single most important habit
in E2E testing: **wait for the actual condition you care about, never for
a guessed amount of time.**

```js
await page.waitForFunction(
  () =>
    window.getComputedStyle(document.getElementById("trigramRevealScreen"))
      .display === "none",
  { timeout: 10_000 }
);
```

This polls the real DOM until the screen has *actually* hidden itself, however
long that takes, and moves on immediately once it has — instead of always
waiting a fixed amount, whether too little (flaky) or too much (slow for no
reason). `page.waitForFunction`'s `timeout` is a ceiling ("give up and fail
after this long"), not a target duration.

### Why these tests never touch `GAME_STATE`, `UI_STATE`, or `wordList` directly

An earlier version of this suite did reach into app internals from
Playwright — `page.evaluate(() => GAME_STATE.trigram)` and similar. That
stopped being merely bad practice and became **structurally impossible**
once `app/js` was bundled by Vite (§8): the bundle wraps the entire app in
one big function (an IIFE — see §8), so `GAME_STATE`/`UI_STATE`/`wordList`
are genuine closure-private variables. There is no way to reach them from
outside, not even via `page.evaluate` (which runs code in the page's real
global scope, the same place DevTools Console would) — a closure variable
isn't in global scope, by definition, regardless of which tool is asking.

The fix ended up being a better test either way: `tests/e2e/helpers.js`
reads the trigram straight off the rendered header
(`.header-element #trigram span`, what a real player actually sees) instead
of an internal variable, and fetches the matching word-list JSON via
Playwright's own HTTP client (`page.request.get`) — the same file the app
itself fetches, requested independently rather than read out of the app's
memory:

```js
export async function firstLevelWord(page) {
  const trigram = await currentTrigram(page); // reads rendered DOM text
  const response = await page.request.get(
    `/data/trigram-word-lists/${trigram.toLowerCase()}_words.json`
  );
  const wordList = await response.json();
  return (wordList[4] || [])[0] || null;
}
```

This is the general lesson from §7 ("prefer driving code through real,
public entry points over reaching into private state") applied one layer
up, at the E2E level: testing through what a user or the network can
observe is more robust than testing through internals, *and* it keeps
working even when a refactor (like the bundler) makes those internals
literally unreachable.

---

## 7. Case study: a testing pain point that led to a real architecture fix

This section originally documented a limitation. It's now a before/after
story, because the pain of testing around that limitation was a strong
enough signal to actually fix the underlying design — which is one of the
best reasons to write tests early: they surface awkward architecture
*before* it calcifies, not after.

### The problem

`app/js/wordChecker.js` used to declare `let wordList = null;` at the top
of the file — module-private state that only the functions in that file
were supposed to touch, set once via `loadWordList()` and read by
`existsInWordList()`/`validateWord()` from then on.

Testing this ran into a real wall. A test file **cannot** reach into
another script's private `let` state from the outside:

```js
wordList = { 4: ["CATS", "PITA"] }; // ReferenceError: wordList is not defined
```

This isn't a bug — it's a genuine, spec-correct rule about how `let`/`const`
variables work (§8), combined with how the test file's code was isolated
from the code loaded via `loadAppScript()`, the eval-based loader this
project used before `app/js` had real `export` statements (§8 covers what
replaced it). The only way to get `wordList` into a known state for a test
was to go around through the real `loadWordList()` function with a mocked
`fetch` — workable, but it meant
*every* test of `validateWord`/`existsInWordList`, even ones with nothing
conceptually to do with networking, had to first mock a network call just
to get set up. It also meant one test had to run before every other test in
the file (to catch `wordList` in its genuinely-never-loaded state), which
is a fragile kind of test to write and a sign something's off architecturally.

### The fix

The root issue: `wordList` was **hidden mutable state** inside a module
whose whole job was supposed to be pure validation logic. The fix was
**dependency injection** — stop letting `wordChecker.js` hold the word
list itself, and have the caller (`app/js/game.js`, which already tracks
per-game state in `GAME_STATE`) own that data and pass it in:

```js
// Before
function existsInWordList(word, currWordLength) {
  if (!wordList) { ... }        // reads hidden module state
  ...
}

// After
function existsInWordList(word, currWordLength, wordList) {  // wordList is now a parameter
  if (!wordList) { ... }
  ...
}
```

```js
// app/js/game.js
GAME_STATE.wordList = await loadWordList(GAME_STATE.trigram); // caller owns the data
...
validateWord(word, GAME_STATE.trigram, GAME_STATE.wordLength_current, GAME_STATE.wordList)
```

`loadWordList()` itself changed to match: it now just fetches and *returns*
the parsed data, instead of fetching and stashing it into a module
variable as a side effect.

One thing worth knowing about JS specifically: passing `wordList` around
like this is free, no matter how large it is. Objects and arrays are
passed by reference, not copied — `wordList` (which can be several hundred
KB for this app's longer trigrams) costs exactly the same to pass as a
number would. There's no C-style "copying a big struct on every call"
tax in JS.

### The result

Compare `tests/unit/wordChecker.test.js` now to the version described
above: every test of `validateWord`/`existsInWordList` is back to the
`fixtureWordList` shape from §3/§4 — a plain object literal, passed
directly, no `fetch` mock, no `beforeAll`/`beforeEach` setup, no
ordering constraint. `fetch` mocking is now confined to the two tests
that are actually, conceptually about networking: `loadWordList`'s
success and failure paths (§5).

This is the general lesson worth keeping: **when a test is awkward to
write, that's often not a testing problem — it's the test telling you
something about the code's design.** Hidden mutable state is hard to test
for exactly the same reason it's hard to reason about at 11pm debugging a
production issue: you can't tell what a function will do just by reading
its signature.

### Where this pattern still exists

`tests/unit/stats.test.js` has a milder version of the same thing: `STATS`
(a `const` object in `app/js/ui/stats.js`) can't be reset directly from
outside either, so the tests call the real `loadStats()` function before
each assertion instead, which fully recomputes the fields those tests
check. This wasn't refactored the same way `wordChecker.js` was, because
`STATS` genuinely is meant to be shared, running UI state (multiple
functions read and incrementally update it as the game progresses) rather
than a single value computed fresh from inputs — so injecting it as a
parameter everywhere wouldn't be the same clear win. Not every instance of
"module state" is a design smell; `wordList` was, because it was really
just data flowing from one function to another with nowhere useful to live
in between.

### A different tool for a different problem: `vi.mock()`

`app/js/ui/stats.js` imports `GAME_STATE` and `wordLength_start` from
`app/js/game.js` (§8 has the full dependency graph). That's a real problem
for `tests/unit/stats.test.js`: `game.js` is the app's entry point and has
a top-level `initApp()` call that does a real `fetch()` and touches DOM
elements a bare test document doesn't have. Importing `ui/stats.js` for
real would transitively try to boot the entire app inside a unit test.

The fix here isn't dependency injection (stats.js's calc functions
genuinely don't need `GAME_STATE` — only the DOM-rendering functions this
suite doesn't unit-test do) — it's `vi.mock()`, which replaces an entire
module, side effects included, with a stand-in you control:

```js
vi.mock("../../app/js/game.js", () => ({
  GAME_STATE: {},
  wordLength_start: 4,
}));

import { calcNumGamesWon, /* ...etc */ } from "../../app/js/ui/stats.js";
```

Vitest hoists `vi.mock()` calls above the imports below them automatically
(this looks like it runs "too late" to matter, but it doesn't) — so by the
time `ui/stats.js` is loaded and it asks for `../game.js`, Vitest hands
back the fake module instead of running the real one. `game.js`'s
`initApp()` never executes at all in this test file. This is the standard
way to cut a module out of an import graph for testing purposes: not by
testing around its behavior, but by declaring "when anything asks for this
module, use this instead."

---

## 8. Case study: from classic scripts to real ES modules + a bundler

Like §7, this section used to describe a limitation and a hypothetical fix.
The app has since actually been converted, so this is now a real before/after
story — including the circular-dependency problem that originally motivated
it and a hand-verified trace of why the fix is safe.

### The problem

This app predated any build tooling: `index.html` loaded each file with a
plain classic `<script>` tag —

```html
<script src="app/js/debug.js"></script>
<script src="app/js/calendar.js"></script>
...
<script src="app/js/game.js"></script>
```

— and every function was declared the ordinary way: `function loadGameState() { ... }`,
no `export` keyword anywhere. When a browser runs a classic script, top-level
`function` declarations become properties of the global object (`window`)
automatically — that's *why* `game.js` could call `loadGameState()` (defined
in `storage.js`) without ever writing an `import`: every previously-loaded
script's functions were just sitting there as ordinary global names.

This has two real costs, not just one:
- **No explicit dependency list.** Nothing in `game.js` declared "I need
  `loadGameState` from `storage.js`" — you had to read `index.html`'s script
  order and infer it. Load order *was* the dependency graph, just invisibly.
- **No encapsulation.** Every function and top-level variable in every file
  was visible to (and overwritable by) every other file.

In practice, the load-order problem is worse than it sounds, because this
app's files don't form a clean chain — they form a **genuine multi-way
circular dependency**. Tracing every real cross-file function call (not
just "what's defined where," but "what's actually *called* from where")
turns up:

- `calendar.js` ↔ `debug.js` (`getGameID()` reads `DEBUG`; `debug.js`'s
  helpers call `getGameID()`)
- `game.js` → `ui/view.js` → `ui/modal.js` → `interactionHandler.js` →
  `game.js` (a four-file cycle: interaction handling needs `game.js`'s
  `submitGuess`/`addLetter`/`deleteLetter`; the UI layer needs
  `interactionHandler.js`'s `startInteraction`/`stopInteraction`; the modal
  layer and view layer call into each other's screen-transition functions)
- `ui/stats.js` → `game.js` (for `GAME_STATE`/`wordLength_start`) closes yet
  another loop back through `ui/view.js`

With classic scripts, this "worked" only because of load order and because
every actual cross-reference happened to be inside a function body (called
later) rather than executed immediately at script-load time — a fact that
was never checked or enforced anywhere, just true by luck and convention.
This is exactly the kind of thing that breaks in a confusing way once a
codebase grows past what one person can hold in their head — which matches
this project's own history of hitting a circular dependency and having to
restructure around it.

### The fix

Every function that's used outside its own file got `export`; every file
that uses something from another file got an explicit `import` at the top.
`app/js/game.js`, for instance:

```js
// Import order matters here: debug.js/calendar.js (a two-way cycle with each
// other) must fully evaluate before ui/view.js is imported, since ui/view.js
// transitively pulls in ui/modal.js, which calls calendar.js's getWeekString/
// getGameIDString immediately at its own top level...
import { DEBUG, clearCurrentGameData, setFakePastGameData } from "./debug.js";
import { loadTrigramCalendar, getGameID, trigram_calendar } from "./calendar.js";
import { loadWordList, validateWord } from "./wordChecker.js";
import { loadGameState, saveGameState } from "./storage.js";
import { UI_STATE } from "./ui/view.js";
```

**Does ES modules actually tolerate that circular graph?** Yes, but not
unconditionally — this is worth understanding rather than taking on faith,
since getting it wrong would silently crash a live app. The rule: ES module
evaluation happens in two phases per module — *instantiation* (all
top-level `function` declarations become available immediately, hoisted,
regardless of import order) and *evaluation* (the module's actual top-level
statements run, in dependency order, skipping anything already in
progress for a cycle). Two things have to both be true for a circular
import to be safe:

1. Every cross-file reference that's a *function* is fine, always — function
   declarations are hoisted, so they're callable the instant any module in
   the graph starts evaluating, even before the exporting module's own body
   has run.
2. Every cross-file reference that's a *value* (a `const`/`let`, like
   `DEBUG` or `GAME_STATE`) is only fine if nothing reads it **immediately**
   at another module's top level, before the defining module has had a
   chance to run its own initializer. Reading it from *inside* a function
   body is fine, because that function won't actually get called until
   later, by which point everything has finished evaluating.

This codebase satisfies rule 2 by accident of how it was already written
(every cross-file value read happens inside a function/event-handler body,
never at a module's own top level) — checked by hand, file by file, before
making this change, not assumed. The one place that looked risky at first
— `ui/modal.js` calls `setTitleScreenWeek()`/`setTitleScreenGameNumber()`
immediately at its own top level, and those read `calendar.js`'s `getWeekString`/`getGameIDString` — turned out to be safe because `calendar.js`
has no such immediate reads of its own, so it always finishes evaluating
early, well before `modal.js` is ever reached. `npm run build` (Vite/Rollup)
transformed and bundled all 9 files with zero errors, and the full test
suite (unit + E2E, including a real page load in a real browser) passing
is the actual proof, not just the trace.

One more thing this conversion caught, as a bonus: `app/js/storage.js` had
`pastGames = []` (no `let`/`const`/`var`) inside `loadPastGames()` — a
classic-script implicit global, silently legal in non-strict mode. ES
modules are always strict mode, where that same line throws
`ReferenceError`. This bug was invisible until the module conversion
surfaced it — a real, if minor, example of §7's broader point: cleaning up
one thing (testability, encapsulation) can reveal problems that were never
visible before.

### Vite: what it's doing here, and how it fits your stack

Real `import`/`export` syntax works natively in every modern browser via
`<script type="module">` — no bundler is *required* to use ES modules at
all. This app uses one anyway (**Vite**), but in a scoped way worth being
precise about, because "add a build tool" can mean very different amounts
of change:

- **ES modules** are a language/browser feature: the `import`/`export`
  syntax and module-loading semantics described above. Free, native, no
  tooling needed.
- **A build tool** (Vite, Webpack, esbuild, Rollup) is a separate, optional
  layer that *consumes* that syntax and does more: bundling many files into
  fewer network requests, minification, a dev server with hot-reload,
  importing non-JS assets like CSS or images as part of the module graph.

This project uses Vite in its narrowest useful mode — **as a bundler only**,
not its usual "app" mode (`index.html` as the entry, dev server, hot
module reload). `vite.config.js` points straight at `app/js/game.js` and
outputs one fixed-name file:

```js
build: {
  outDir: "app/dist",
  rollupOptions: {
    input: resolve(__dirname, "app/js/game.js"),
    output: { format: "iife", entryFileNames: "bundle.js" },
  },
}
```

`index.html` just has one `<script src="app/dist/bundle.js"></script>` now,
referencing that fixed output path directly — Vite never touches
`index.html` itself. `npm run build` produces the file; `npm run build:watch`
rebuilds on save (no dev server/hot-reload — just rebuild-and-manually-refresh).

The reason for this narrow scope: Vite's normal "app" mode wants to own
*every* static asset a page needs (consolidating them into a `public/`
folder it copies verbatim into its build output), which would have meant
moving `data/` — written to directly by seven-plus Python scripts in
`tools/` as part of the weekly content pipeline — and rethinking
`tools/label/`, a second, separate static page this same repo serves.
Scoping Vite to just `app/js` means none of that: `data/`, `tools/label/`,
`site.webmanifest`, `og-image.png`, and Netlify's publish settings are all
completely untouched. The trade-off is giving up Vite's dev-server/hot-reload
experience — a fair trade here, since the actual problem being solved was
correctness (the circular-dependency bug), not developer-experience polish.

### What this meant for the test suite

- `tests/unit/helpers/loadAppScript.js` (the eval-based loader from earlier
  versions of this doc) is gone. Every unit test file now imports the real
  module directly: `import { validateWord } from "../../app/js/wordChecker.js"`.
- §7's `wordList` problem and its "must run first" test-ordering workaround
  are fully resolved (real exports mean nothing needs the eval trick to
  begin with) — but a *new*, different problem showed up: `ui/stats.js`
  now really imports `game.js`, whose top-level `initApp()` call does a
  real `fetch()`. §7's "A different tool for a different problem" section
  covers the fix (`vi.mock()`).
- E2E tests can no longer reach `GAME_STATE`/`UI_STATE`/`wordList` at all —
  Vite's IIFE bundle (`(function(){ ... })()`) makes them genuine
  closure-private variables, not just "not on `window`." §6's "Why these
  tests never touch `GAME_STATE`..." section covers what replaced those reads.

---

## 9. What this test suite does *not* cover yet

Being honest about test coverage is as important as having tests at all — a
false sense of security is worse than a known gap. As of this writing:

- **Most of `game.js`'s state machine has no direct unit tests.**
  `startGame`, `startLevel`, `addLetter`, `deleteLetter`, `submitGuess`,
  `handleValidGuess`, `handleInvalidGuess`, `endGame` are only exercised
  *indirectly*, through the E2E tests typing real keystrokes. There's no
  test that calls `addLetter()` directly and checks `GAME_STATE`'s
  resulting shape.
- **The full 15-round game — round transitions, the "You Win!" screen at
  round 3, the bonus round, and the final `endGame()` countdown — is
  entirely untested.** The E2E tests only cover completing the *first*
  word (4 letters) — they don't play a game to completion. This is the
  single biggest gap: the most complex UI choreography in the app
  (`app/js/ui/view.js`'s round-transition logic, `app/js/ui/modal.js`'s
  You Win overlay, `startBonusGame()`) has zero automated coverage.
- **`app/js/interactionHandler.js`'s on-screen keyboard and long-press
  delete are untested.** Only physical keyboard presses are covered; mouse
  clicks on the virtual keyboard (`handleMouseClick`) and the
  press-and-hold backspace acceleration (`handleDeleteStart`/`handleDeleteStop`)
  have no tests.
- **`app/js/ui/modal.js` is entirely untested directly** — title screen
  content, the mobile/landscape rotation warning, and the stats-screen
  open/close wiring have no assertions of their own (they're only
  incidentally exercised as a side effect of the E2E setup helper clicking
  through them).
- **DOM-rendering functions in `app/js/ui/stats.js`** (`setWordListUI`,
  `addToWordListUI`, `setCountingStatsUI`, `setHistogramUI`) are untested —
  only the pure math functions they depend on (`calcNumGamesWon`, etc.) are
  covered.
- **`loadTrigramCalendar()`'s failure path is untested.** `app/js/calendar.js`'s
  `catch` block (falls back to an empty array on a failed fetch) has no
  test. (`loadWordList()`'s equivalent failure path in `wordChecker.js` *is*
  now covered, as of §7's refactor — see `tests/unit/wordChecker.test.js`'s
  `loadWordList` block.)

None of this is urgent — the highest-value paths (a valid guess, an
invalid guess, and persistence across reload) are covered — but the full
win/bonus-round flow is the gap most worth closing next if you want to
extend this suite.

---

## 10. Running and extending the suite

```bash
npm run build          # bundle app/js -> app/dist/bundle.js (needed before the app can run at all — see §8)
npm run build:watch    # same, rebuilding on every save
npm test               # unit tests (Vitest), ~1s
npm run test:watch     # unit tests, re-run automatically on file save
npm run test:e2e       # E2E tests (Playwright), ~8s (builds automatically first, see playwright.config.js)
npm run test:e2e:ui    # E2E tests with Playwright's interactive UI/debugger
npm run test:all       # everything
```

To add a new unit test: add a file under `tests/unit/` ending in
`.test.js`, `import` what you need directly from the real file under
`app/js/`, and write `describe`/`it` blocks the way `wordChecker.test.js`
does. If the file you're testing imports something with side effects you
don't want in a test (a real `fetch`, DOM access `jsdom` won't have) —
like `ui/stats.js` importing `game.js` — reach for `vi.mock()` (§7) rather
than trying to avoid the import.

To add a new E2E test: add a `.spec.js` file under `tests/e2e/`, reuse
`playThroughToInteractive(page)` from `helpers.js` to skip past the title
screens, and drive the rest with `page.keyboard`/`page.click`/`expect(page.locator(...))`.
Read state from the DOM or the network (`page.request`), never from app
internals — see §6's "Why these tests never touch `GAME_STATE`..." for why
that's not just style, but structurally required now.
