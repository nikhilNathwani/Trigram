// Shared setup for the gameplay E2E specs: get a fresh page all the way
// from "just navigated" to "the keyboard is live and accepting input,"
// clicking through the same title -> help -> trigram-reveal screen sequence
// a real first-time player sees.
//
// Everything here observes the DOM and network only, never app internals.
// That's not just style: app/js is now bundled by Vite into a single IIFE
// (see vite.config.js), so GAME_STATE/UI_STATE/wordList are genuinely
// closure-private — there is no way to reach them from Playwright even in
// principle, unlike before the bundler existed. Testing through what a real
// user/network observes is more robust anyway (see TESTING_GUIDE.md §7's
// "prefer public, observable behavior over internals" point, applied here
// one layer up, at the E2E level).
//
// The trigram-reveal screen dismisses itself via a CSS animation
// (`animationend` in app/js/ui/modal.js), not a fixed delay, so we wait on
// the actual resulting DOM state (`display` flipping to "none") instead of
// guessing a sleep duration. A guessed duration is exactly what made an
// earlier, throwaway manual test of this app flaky — the animation is 5s in
// app/css/style.css, and a shorter guessed wait silently ate every keystroke
// because the app was still ignoring input.
// The header's trigram letters are only rendered once initApp() has fully
// resolved (calendar fetch, then word-list fetch, then startGame()) — see
// setTrigramHeader() in app/js/ui/view.js. Waiting on this is a black-box
// proxy for "the game is ready," including the exact ordering the
// initApp/startGame split is responsible for (word list loaded before
// input is accepted). Used both on first load and after a reload.
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
	await page.click("#helpScreen .closeButton");

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
