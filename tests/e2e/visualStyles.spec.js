import { expect, test } from "@playwright/test";
import {
	makeWords,
	makeWordsContaining,
	seedLocalStorage,
	todayGameID,
	waitForReady,
} from "./helpers.js";

// Regression coverage for a class of bug that's easy to introduce silently
// in plain CSS: a selector that should win the cascade doesn't (wrong
// specificity, wrong source order), or a rule that should apply to
// dynamically-created elements never matches them. Neither gameplay.spec.js
// nor statsDialog.spec.js check *rendered* style — only DOM structure/text —
// so a button staying the wrong color, or a histogram bar rendering
// invisible, wouldn't fail anything else in this suite.
//
// "transparent" is asserted as the browser's computed value for it,
// rgba(0, 0, 0, 0) — what getComputedStyle (and so toHaveCSS) actually
// reports, regardless of how the CSS spelled it.
const TRANSPARENT = "rgba(0, 0, 0, 0)";

test.describe("visual styles", () => {
	test("title screen: How to play is transparent, Play is not", async ({
		page,
	}) => {
		await page.goto("/index.html");
		await waitForReady(page);

		await expect(page.locator("#howToButton")).toHaveCSS(
			"background-color",
			TRANSPARENT
		);
		await expect(page.locator("#playButton")).not.toHaveCSS(
			"background-color",
			TRANSPARENT
		);
	});

	test("you win screen: View stats is transparent, Bonus round is not", async ({
		page,
	}) => {
		// A game with 9 completed levels (word lengths 4-12) drops the player
		// straight into the You Win screen on load — see the
		// "levelsCompleted == 9" exception in handleGameStarted (view.js) — no
		// need to actually play through 9 real guesses.
		await page.goto("/index.html");
		await waitForReady(page);
		const g = await todayGameID(page);

		await seedLocalStorage(page, {
			[g]: { trigram: "CAT", wordsProvided: makeWordsContaining("CAT", 12) },
		});
		await page.reload();
		await waitForReady(page);

		await expect(page.locator("#youWinScreen")).toBeVisible();
		await expect(page.locator("#viewStatsButton")).toHaveCSS(
			"background-color",
			TRANSPARENT
		);
		await expect(page.locator("#bonusRoundButton")).not.toHaveCSS(
			"background-color",
			TRANSPARENT
		);
	});

	test("stats dialog: a populated histogram bar actually renders visible", async ({
		page,
	}) => {
		await page.goto("/index.html");
		await waitForReady(page);
		const g = await todayGameID(page);

		// One past game is enough to populate a single histogram row. The
		// current game is left untouched (no seeded progress), so — unlike
		// the you-win test above — handleGameStarted's "resume" branch never
		// triggers and the normal title/help/reveal sequence still shows on
		// reload; play through it the same way playThroughToInteractive does.
		await seedLocalStorage(page, {
			[g - 1]: { trigram: "DOG", wordsProvided: makeWords(4) },
		});
		await page.reload();
		await waitForReady(page);
		await page.click("#playButton");
		await page.click("#helpDialog .closeButton");
		await page.waitForFunction(
			() =>
				window.getComputedStyle(document.getElementById("trigramRevealScreen"))
					.display === "none",
			{ timeout: 10_000 }
		);

		await page.click("#statsButton");
		const bar = page.locator(
			"#statDistributionValue .stat-statDistribution-itemCount"
		);
		await expect(bar).toHaveText("1");
		// Not just present in the DOM with text — actually rendered with a
		// visible fill and non-zero width, the two things a missing/unmatched
		// CSS rule would silently break without touching the text content.
		await expect(bar).not.toHaveCSS("background-color", TRANSPARENT);
		const box = await bar.boundingBox();
		expect(box.width).toBeGreaterThan(0);
	});
});
