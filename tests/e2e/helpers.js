// Shared setup for the gameplay E2E specs. Everything here observes the
// DOM/network only, never app internals — trigram/wordList/levelsCompleted
// are real ES module bindings Playwright has no way to reach, and testing
// through what a user/network actually observes is more robust anyway (see
// TESTING_GUIDE.md §7).
//
// waitForReady() polls the rendered header rather than a fixed delay: an
// earlier version slept a guessed duration instead, which silently ate
// keystrokes whenever the real trigram-reveal animation (5s, in
// screens.css) ran longer than guessed. Waiting on the header also doubles
// as a readiness check for the whole initApp() -> startGame() load
// sequence, not just that one animation.
export async function waitForReady(page) {
	await page.waitForFunction(
		() => document.querySelectorAll(".header-element #trigram span").length > 0,
		{ timeout: 10_000 }
	);
}

export async function playThroughToInteractive(page) {
	await page.goto("/index.html");
	await waitForReady(page);

	await page.click("#playButton");
	await page.click("#helpDialog .closeButton");

	await page.waitForFunction(
		() =>
			window.getComputedStyle(document.getElementById("trigramRevealScreen"))
				.display === "none",
		{ timeout: 10_000 }
	);
}

// Reads the trigram straight off the rendered header (what a real player
// sees), then fetches the same word-list JSON the app itself fetches, via
// Playwright's own HTTP client rather than the page's internal state.
export async function currentTrigram(page) {
	return page.evaluate(() =>
		Array.from(document.querySelectorAll(".header-element #trigram span"))
			.map((span) => span.textContent)
			.join("")
	);
}

// Only valid for a fresh game (no localStorage yet, which is what every test
// gets by default — each Playwright test runs in its own isolated browser
// context) — the first level always requires a 4-letter word.
export async function firstLevelWord(page) {
	const trigram = await currentTrigram(page);
	const response = await page.request.get(
		`/data/trigram-word-lists/${trigram.toLowerCase()}_words.json`
	);
	const wordList = await response.json();
	const words = wordList[4] || [];
	return words[0] || null;
}

// Reads today's real, live 0-indexed gameID off the rendered header
// ("Trigram #119" -> 118), the same value calendar.js's getGameID() computed
// client-side to pick today's trigram. Used to seed past-game localStorage
// entries relative to *today*, without reimplementing getGameID()'s date
// math (and its timezone sensitivity) a second time here.
// Requires a page that's already past waitForReady().
export async function todayGameID(page) {
	const text = await page.textContent("#trigram-number"); // "Trigram #119"
	const oneIndexed = parseInt(text.replace(/\D/g, ""), 10);
	return oneIndexed - 1;
}

// Writes localStorage entries before the page's own scripts run, so
// game.js's initApp()/startGame() sees this data on its very first load —
// same technique real persistence relies on, just pre-seeded instead of
// built up through real play. `entries` is { [gameID]: {trigram, wordsProvided} }.
export async function seedLocalStorage(page, entries) {
	await page.addInitScript((data) => {
		for (const [key, value] of Object.entries(data)) {
			window.localStorage.setItem(key, JSON.stringify(value));
		}
	}, entries);
}

// Builds a wordsProvided array in the index-by-length shape storage.js/
// stats.js expect ([null, null, null, null, "<4-letter word>", ...]),
// stopping at `longestLength`. The actual letters don't need to be real
// dictionary words — stats rendering never re-validates them, only game.js's
// live guess submission does (see wordChecker.js's validateWord).
export function makeWords(longestLength, wordLength_start = 4) {
	const words = new Array(wordLength_start).fill(null);
	for (let length = wordLength_start; length <= longestLength; length++) {
		words.push("X".repeat(length));
	}
	return words;
}

// Same shape as makeWords(), but each word is built as `trigram` + filler,
// so it actually contains the trigram (like every real guess must — see
// wordChecker.js's containsTrigram) — needed for current-game fixtures,
// since only its words get rendered into "Your Words" (or, at 9 completed
// levels, trigger handleGameStarted's levelsCompleted == 9 exception
// straight into the You Win screen — see view.js).
export function makeWordsContaining(trigram, longestLength) {
	const wordLength_start = 4;
	const words = new Array(wordLength_start).fill(null);
	for (let length = wordLength_start; length <= longestLength; length++) {
		words.push(trigram + "X".repeat(length - trigram.length));
	}
	return words;
}
