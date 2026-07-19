import { expect, test } from "@playwright/test";
import { currentLevelWord, playThroughToInteractive } from "./helpers.js";

// These tests drive the real app in a real browser — the same file
// index.html loads in production, served exactly the way Netlify serves it
// (plain static files, no build step). This is the layer that covers
// everything the unit tests structurally can't: DOM rendering, the screen
// transitions, keyboard event wiring, and localStorage persisting across a
// real page reload.
test.describe("app startup", () => {
	test("loads without console/page errors and today's word list is ready before the game accepts input", async ({
		page,
	}) => {
		const errors = [];
		page.on("pageerror", (err) => errors.push(err.message));
		page.on("console", (msg) => {
			if (msg.type() === "error") errors.push(msg.text());
		});

		await page.goto("/index.html");

		await page.waitForFunction(() => Boolean(GAME_STATE.trigram), {
			timeout: 10_000,
		});

		// This is the exact ordering the initApp/startGame split (game.js) is
		// responsible for: by the time GAME_STATE.trigram is set, the word
		// list for that trigram must already be loaded too, or an early guess
		// could be wrongly rejected as "not found."
		const wordListLoaded = await page.evaluate(() => Boolean(GAME_STATE.wordList));
		expect(wordListLoaded).toBe(true);

		expect(errors).toEqual([]);
	});
});

test.describe("gameplay", () => {
	test("submitting a valid word completes the level and starts the next one", async ({
		page,
	}) => {
		await playThroughToInteractive(page);
		const word = await currentLevelWord(page);
		expect(word, "expected a word to exist for today's trigram/length").toBeTruthy();

		for (const letter of word) {
			await page.keyboard.press(letter.toLowerCase());
		}

		const levelDiv = page.locator(`#level-${word.length}`);
		await expect(levelDiv).toHaveClass(/complete/);

		const letters = await levelDiv.locator(".word .letter").allTextContents();
		expect(letters.join("")).toBe(word.toUpperCase());
	});

	test("an invalid guess shows an error and does not complete the level", async ({
		page,
	}) => {
		await playThroughToInteractive(page);

		const wrongLengthGuess = "Z"; // shorter than the required 4 letters
		await page.keyboard.press(wrongLengthGuess);
		await page.keyboard.press("Enter");

		await expect(page.locator("#message")).toHaveText("Word not 4 letters long");
		await expect(page.locator("#level-4")).not.toHaveClass(/complete/);
	});

	test("a guess missing the trigram is rejected with the correct message", async ({
		page,
	}) => {
		await playThroughToInteractive(page);
		const trigram = await page.evaluate(() => GAME_STATE.trigram);

		// "ZZZZ" is unlikely to ever contain a real trigram, but guard
		// against the astronomically unlikely case it does.
		test.skip(
			"ZZZZ".includes(trigram),
			"chosen guess accidentally contains today's trigram"
		);

		for (const letter of "zzzz") {
			await page.keyboard.press(letter);
		}

		await expect(page.locator("#message")).toHaveText(`Doesn't contain ${trigram}`);
	});
});

test.describe("persistence", () => {
	test("a completed word survives a page reload", async ({ page }) => {
		await playThroughToInteractive(page);
		const word = await currentLevelWord(page);
		test.skip(!word, "no word available for today's trigram/length");

		for (const letter of word) {
			await page.keyboard.press(letter.toLowerCase());
		}
		await expect(page.locator(`#level-${word.length}`)).toHaveClass(/complete/);

		await page.reload();
		await page.waitForFunction(() => Boolean(GAME_STATE.trigram), {
			timeout: 10_000,
		});

		// On reload with an in-progress game, the app skips the title/help
		// screens entirely (see UI_STATE.startGame in app/js/ui/view.js) and
		// re-renders previously completed levels directly.
		await expect(page.locator(`#level-${word.length}`)).toHaveClass(/complete/);
		const letters = await page
			.locator(`#level-${word.length} .word .letter`)
			.allTextContents();
		expect(letters.join("")).toBe(word.toUpperCase());
	});
});
