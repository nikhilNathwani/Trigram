// Shared setup for the gameplay E2E specs: get a fresh page all the way
// from "just navigated" to "the keyboard is live and accepting input,"
// clicking through the same title -> help -> trigram-reveal screen sequence
// a real first-time player sees.
//
// The trigram-reveal screen dismisses itself via a CSS animation
// (`animationend` in app/js/ui/modal.js), not a fixed delay, so we wait on
// the actual resulting DOM state (`display` flipping to "none") instead of
// guessing a sleep duration. A guessed duration is exactly what made an
// earlier, throwaway manual test of this app flaky — the animation is 5s in
// app/css/style.css, and a shorter guessed wait silently ate every keystroke
// because the app was still ignoring input.
export async function playThroughToInteractive(page) {
	await page.goto("/index.html");

	// initApp() has finished (trigram + word list loaded) once GAME_STATE.trigram is set.
	// (Bare identifier, not globalThis.GAME_STATE — page.evaluate/waitForFunction run in the
	// page's real global scope, like DevTools console, where top-level `const`/`let` resolve
	// fine even though they aren't attached to window as properties.)
	await page.waitForFunction(() => Boolean(GAME_STATE.trigram), {
		timeout: 10_000,
	});

	await page.click("#playButton");
	await page.click("#helpScreen .closeButton");

	await page.waitForFunction(
		() =>
			window.getComputedStyle(document.getElementById("trigramRevealScreen"))
				.display === "none",
		{ timeout: 10_000 }
	);
}

export async function currentLevelWord(page) {
	return page.evaluate(() => {
		const len = GAME_STATE.wordLength_current;
		const words =
			GAME_STATE.wordList && GAME_STATE.wordList[len]
				? GAME_STATE.wordList[len]
				: [];
		return words[0] || null;
	});
}
