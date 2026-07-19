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
await page.waitForFunction(() => Boolean(GAME_STATE.trigram), { timeout: 10_000 });
await page.click("#playButton");
await page.click("#helpScreen .closeButton");
```
(from `tests/e2e/helpers.js`)

`playwright.config.js` boots a real static file server (`http-server`) that
serves this repo exactly the way Netlify does in production — no shortcuts,
no test-only code paths. If a test passes, it's because the actual
production files behaved correctly in an actual browser.

### The flakiness bug this doc's author actually hit (and how it was fixed)

Early drafts of these E2E tests used a fixed delay to wait for a screen
transition to finish:

```js
await page.waitForTimeout(4500); // guessed 4.5 seconds — WRONG
```

This intermittently failed, because the CSS animation it was waiting on
(`#trigramRevealScreen.showTemporarily` in `app/css/style.css`) actually
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

### A Playwright-specific gotcha: `page.evaluate` runs in the *page's* scope

`tests/e2e/helpers.js` and `tests/e2e/gameplay.spec.js` reference `GAME_STATE`
directly:

```js
await page.waitForFunction(() => Boolean(GAME_STATE.trigram), { timeout: 10_000 });
```

Note this is bare `GAME_STATE`, not `globalThis.GAME_STATE` or
`window.GAME_STATE`. That's deliberate, and it's the opposite fix from a
similar-looking problem in the unit tests (§7) — worth contrasting directly:

- **Vitest test code** runs in a sandboxed Node module, *separate* from
  wherever `loadAppScript()` evaluated the app's source — so it can't see
  the app's top-level `let`/`const` variables as bare names.
- **Playwright's `page.evaluate`/`waitForFunction`** send a function to run
  *inside the real browser tab*, in that page's actual global scope — the
  same scope you'd be typing into if you opened DevTools and used the
  Console tab by hand. From there, `GAME_STATE` (declared with `const` at
  the top of `app/js/game.js`) resolves exactly like it would if you typed
  it into DevTools yourself.

Same underlying JS rule (§8 explains it in full) — opposite practical
consequence in each tool, because of *where* the code actually executes.

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
variables work (§8), combined with how Vitest isolates each test file's
code from the code loaded via `loadAppScript()`. The only way to get
`wordList` into a known state for a test was to go around through the real
`loadWordList()` function with a mocked `fetch` — workable, but it meant
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

---

## 8. "No `export` statements — every function is a bare global." What does that actually mean?

This app predates any build tooling: `index.html` loads each file with a
plain classic `<script>` tag —

```html
<script src="app/js/calendar.js"></script>
<script src="app/js/storage.js"></script>
...
<script src="app/js/game.js"></script>
```

— and every function in those files is declared the ordinary way:
`function loadGameState() { ... }`, with no `export` keyword anywhere. This
is **not** a mistake or something left unfinished; it's simply how nearly
all JavaScript was written before ES Modules existed, and it still works
fine in a browser today.

### What a classic script actually does

When the browser runs a classic `<script>` tag, top-level `function`
declarations become properties of the global object (`window`) —
automatically, with no keyword needed. That's *why* `app/js/game.js` can
call `loadGameState()` (defined in `storage.js`) or `validateWord()`
(defined in `wordChecker.js`) without ever writing an `import`: by the time
`game.js` runs, every previously-loaded script's functions are just sitting
there as ordinary global names, available to everyone, forever, for the
rest of the page's life.

The tradeoffs of this approach:
- **No explicit dependency list.** Nothing in `game.js` declares "I need
  `loadGameState` from `storage.js`" — you have to read `index.html`'s
  script order and infer it. Load order becomes a hidden dependency graph.
- **No encapsulation.** Every function and top-level variable in every file
  is visible to (and overwritable by) every other file. Two files that
  happen to declare a same-named `function` or `var` would silently
  clobber each other — modules don't have this problem, because each
  module's names are private by default.
- **It's also exactly why `tests/unit/helpers/loadAppScript.js` exists.**
  A test file can't `import { validateWord } from "../../app/js/wordChecker.js"`,
  because there's nothing to import — `validateWord` isn't exported, it's
  just a name that becomes global the moment the file's code runs, exactly
  like it does in the browser. `loadAppScript()` works around this by
  literally re-creating what a `<script>` tag does (see the comment in that
  file for the exact mechanism), so the tests can load the real file and
  get access to its global functions the same way a browser would — no
  rewrite of the app required.

### What `export`/`import` (ES Modules) would look like instead

If `wordChecker.js` were converted to a module, it would look like this:

```js
// app/js/wordChecker.js (as a module)
export function validateWord(word, trigram, currWordLength) { ... }
export function isWordLengthReached(word, currWordLength) { ... }
// wordList would stay un-exported — genuinely private now, not just "not written to globalThis"
```

```js
// app/js/game.js (as a module)
import { validateWord } from "./wordChecker.js";
```

```html
<script type="module" src="app/js/game.js"></script>
```

With this shape:
- Every dependency is an explicit `import` line — you can read a file and
  know exactly what it needs, with no guessing from script order.
- Nothing leaks into global scope by accident; a module's internal names
  are private unless explicitly `export`ed.
- Test files could `import { validateWord } from "../../app/js/wordChecker.js"`
  directly — no `loadAppScript()` trick needed. It would also make the
  general *shape* of the §7 problem structurally rarer: each module's `let`/`const`
  state is genuinely private to that module and easy to reason about in
  isolation, rather than merely "not written to `globalThis`" while still
  being globally reachable-in-spirit the way classic scripts are.

**This is not a recommendation to convert the app right now.** It would
touch every source file and `index.html`'s script tags, and — for a live
app with real users — that's a real, if probably-low, risk for a purely
structural win. It's flagged here so the tradeoff is understood, in case
it's ever worth revisiting deliberately, not as an implicit todo.

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
npm test              # unit tests (Vitest), ~1s
npm run test:watch    # unit tests, re-run automatically on file save
npm run test:e2e      # E2E tests (Playwright), ~8s
npm run test:e2e:ui   # E2E tests with Playwright's interactive UI/debugger
npm run test:all      # everything
```

To add a new unit test: add a file under `tests/unit/` ending in
`.test.js`, `loadAppScript("theFile.js")` in a `beforeAll`, and write
`describe`/`it` blocks the way `wordChecker.test.js` does. To add a new
E2E test: add a `.spec.js` file under `tests/e2e/`, reuse
`playThroughToInteractive(page)` from `helpers.js` to skip past the title
screens, and drive the rest with `page.keyboard`/`page.click`/`expect(page.locator(...))`.
