import { expect, test } from "@playwright/test";
import { waitForReady } from "./helpers.js";

// Runs only under the "iphone-webkit" project (see playwright.config.js):
// this bug never reproduces in Chromium, whose :focus-visible heuristic
// doesn't fire after a tap. WebKit's does — showModal()'s initial focus
// counted as :focus-visible, so iOS Safari drew a persistent blue ring
// around each dialog (and, once .closeButton became a real <button>, on the
// X instead). See the :focus-visible comment in dialogs.css.
//
// Asserts on whatever element actually holds focus rather than a specific
// one, so it keeps catching the ring if browsers change where they put
// initial focus.
async function focusedRing(page) {
	return page.evaluate(() => {
		const el = document.activeElement;
		const style = getComputedStyle(el);
		return {
			element: el.id || el.className || el.tagName,
			ring: el.matches(":focus-visible") && style.outlineStyle !== "none",
		};
	});
}

async function waitForRevealToFinish(page) {
	await page.waitForFunction(
		() =>
			getComputedStyle(document.getElementById("trigramRevealScreen"))
				.display === "none",
		{ timeout: 10_000 },
	);
}

test("tapping open the help and stats dialogs shows no focus ring", async ({
	page,
}) => {
	await page.goto("/index.html");
	await waitForReady(page);

	await page.tap("#playButton");
	await expect(page.locator("#helpDialog")).toBeVisible();
	expect(await focusedRing(page)).toMatchObject({ ring: false });

	await page.tap("#helpDialog .closeButton");
	await expect(page.locator("#helpDialog")).toBeHidden();
	await waitForRevealToFinish(page);
	expect(await focusedRing(page)).toMatchObject({ ring: false });

	await page.tap("#statsButton");
	await expect(page.locator("#statsDialog")).toBeVisible();
	expect(await focusedRing(page)).toMatchObject({ ring: false });

	await page.tap("#statsDialog .closeButton");
	await expect(page.locator("#statsDialog")).toBeHidden();
	expect(await focusedRing(page)).toMatchObject({ ring: false });

	// The header button that opened stats is what a returning keyboard user
	// would land on — make sure re-opening help from it is clean too.
	await page.tap("#helpButton");
	await expect(page.locator("#helpDialog")).toBeVisible();
	expect(await focusedRing(page)).toMatchObject({ ring: false });
});
