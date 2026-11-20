import { expect, test } from "@playwright/test";
import { playThroughToInteractive } from "./helpers.js";

// The counterpart to dialogFocus.iphone.spec.js: hiding the focus ring a
// tap shouldn't produce must not also hide it from keyboard users. The X is
// a real <button> so Tab can reach it, and it must still show its ring.
test("keyboard users can Tab to each dialog's X and see its focus ring", async ({
	page,
}) => {
	await playThroughToInteractive(page);

	for (const [opener, dialog] of [
		["#helpButton", "#helpDialog"],
		["#statsButton", "#statsDialog"],
	]) {
		await page.focus(opener);
		await page.keyboard.press("Enter");
		await expect(page.locator(dialog)).toBeVisible();

		const close = page.locator(`${dialog} .closeButton`);
		for (
			let i = 0;
			i < 3 &&
			!(await close.evaluate((el) => el === document.activeElement));
			i++
		) {
			await page.keyboard.press("Tab");
		}
		await expect(close).toBeFocused();
		expect(
			await close.evaluate(
				(el) =>
					el.matches(":focus-visible") &&
					getComputedStyle(el).outlineStyle !== "none",
			),
		).toBe(true);

		await page.keyboard.press("Enter");
		await expect(page.locator(dialog)).toBeHidden();
	}
});
