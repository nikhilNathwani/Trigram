import { expect, test } from "@playwright/test";
import {
	currentTrigram,
	playThroughToInteractive,
	seedLocalStorage,
	todayGameID,
	waitForReady,
} from "./helpers.js";

// This replaces the old, manual way of eyeballing the stats dialog with
// realistic-looking data: public/js/debug.js used to have a
// setFakePastGameData() you'd flip on by hand-editing a DEBUG flag, with no
// assertions attached. That's gone now (unused for ~2 years) — this file is
// its replacement, as real, repeatable, asserted coverage instead of a
// manual toggle nobody reached for.
//
// The three stats sections (see StatsDialog.astro / ui/stats.js) each read
// from a different source, so each needs deliberately varied fixture data
// to actually exercise it:
//   - "Your Words"      <- the CURRENT game's own stored progress
//   - "Your Stats"       <- loadPastGames() (every *other* completed gameID)
//   - "Longest Word Distribution" <- the same past-games data, bucketed by length

test.describe("stats dialog with representative history", () => {
	test("renders word list, counting stats, and histogram for a realistic mix of past games", async ({
		page,
	}) => {
		// Phase 1: a plain, unseeded load just to read today's real gameID off
		// the header — see todayGameID()'s comment for why this beats
		// reimplementing getGameID()'s date math here.
		await page.goto("/index.html");
		await waitForReady(page);
		const g = await todayGameID(page);
		test.skip(
			g < 12,
			"not enough game history yet for a representative fixture (see todayGameID)"
		);
		// addToWordListUI highlights game.js's *live* trigram (set from the
		// real calendar by initApp()), not whatever we put in a localStorage
		// fixture — so the current game's words must actually contain it.
		const liveTrigram = await currentTrigram(page);

		// Phase 2: seed a deliberately varied history, then reload so
		// game.js's initApp() sees it on load.
		//
		// Past games (ascending gameID): a 6-game streak (g-12..g-7), a gap at
		// g-6, then a shorter 3-game streak (g-3..g-1). The *current* game
		// (g, seeded below) extends that second streak to 4 and itself counts
		// as "played" (see loadStats()/loadCurrentGame()) since it has at
		// least one completed level — so current streak (4) and max streak
		// (6, still the first run) are distinct and independently checkable.
		// Word lengths span the full 4-15 range at least once, with length 12
		// (the win threshold) hit 3x to also exercise the histogram's
		// relative bar-width scaling (its widest bar).
		const pastGames = {
			[g - 12]: { trigram: "ABC", wordsProvided: makeWords(4) }, // loss
			[g - 11]: { trigram: "DEF", wordsProvided: makeWords(12) }, // win
			[g - 10]: { trigram: "GHI", wordsProvided: makeWords(15) }, // win, max length
			[g - 9]: { trigram: "JKL", wordsProvided: makeWords(7) }, // loss
			[g - 8]: { trigram: "MNO", wordsProvided: makeWords(9) }, // loss
			[g - 7]: { trigram: "PQR", wordsProvided: makeWords(12) }, // win
			// gap at g-6: breaks the streak, both games's real name and
			// content don't matter, only that no entry exists for this key
			[g - 3]: { trigram: "STU", wordsProvided: makeWords(6) }, // loss
			[g - 2]: { trigram: "VWX", wordsProvided: makeWords(13) }, // win
			[g - 1]: { trigram: "YZA", wordsProvided: makeWords(12) }, // win
		};
		// Current (live) game: 3 words already submitted, to stress "Your
		// Words" beyond the single-word case the gameplay.spec.js test covers.
		// Built with the real live trigram as a prefix rather than
		// makeWords()'s plain filler, so this also exercises
		// addToWordListUI's trigram-highlight span, not just word count.
		const currentGame = {
			[g]: {
				trigram: liveTrigram,
				wordsProvided: makeWordsContaining(liveTrigram, 6),
			},
		};
		await seedLocalStorage(page, { ...pastGames, ...currentGame });

		await page.reload();
		await waitForReady(page);
		// Seeded current-game progress makes handleGameStarted() skip the
		// title/help/reveal screens straight to the game view — see the
		// wordsProvided.length > 0 branch in ui/view.js's handleGameStarted.
		await page.waitForSelector("#keyboard");

		await page.click("#statsButton");
		await expect(page.locator("#statsDialog")).toBeVisible();

		// --- "Your Words": the current game's 3 seeded words, trigram highlighted ---
		const wordListText = await page.locator("#wordListValue").innerText();
		for (const word of currentGame[g].wordsProvided.filter(Boolean)) {
			expect(wordListText).toContain(word);
		}
		await expect(
			page.locator("#wordListValue .stat-wordList-trigram").first()
		).toHaveText(liveTrigram);

		// --- "Your Stats": hand-computed from the fixture above, current
		// game (longestWord 6, not yet a win) included as the 10th game ---
		await expect(page.locator("#stat-numGamesPlayed")).toHaveText("10");
		await expect(page.locator("#stat-winPercentage")).toHaveText("50"); // 5 wins / 10 games
		await expect(page.locator("#stat-currentStreak")).toHaveText("4");
		await expect(page.locator("#stat-maxStreak")).toHaveText("6");

		// --- "Longest Word Distribution": full 4-15 range, widest bar at 12 ---
		const rows = page.locator("#statDistributionValue .stat-statDistribution-item");
		await expect(rows).toHaveCount(12); // one row per length 4..15 inclusive

		const row12 = rows.filter({
			has: page.locator(".stat-statDistribution-itemLength", { hasText: "12:" }),
		});
		await expect(row12.locator(".stat-statDistribution-itemCount")).toHaveText("3");

		// Current game's own bar (length 6) — joins g-3's loss at the same
		// length, confirming the current game's contribution merges into the
		// histogram rather than needing its own separate row.
		const row6 = rows.filter({
			has: page.locator(".stat-statDistribution-itemLength", { hasText: "6:" }),
		});
		await expect(row6.locator(".stat-statDistribution-itemCount")).toHaveText("2");
	});

	test("shows the empty state with no games played", async ({ page }) => {
		await playThroughToInteractive(page);
		await page.click("#statsButton");

		await expect(page.locator("#wordListEmptyState")).toBeVisible();
		await expect(page.locator("#stat-numGamesPlayed")).toHaveText("0");
		await expect(page.locator("#stat-winPercentage")).toHaveText("n/a");
		await expect(page.locator("#stat-currentStreak")).toHaveText("0");
		await expect(page.locator("#stat-maxStreak")).toHaveText("0");
		await expect(page.locator("#statDistributionValue")).toContainText(
			"A graph of your longest words from each game will appear here."
		);
	});
});

// Builds a wordsProvided array in the index-by-length shape storage.js/
// stats.js expect ([null, null, null, null, "<4-letter word>", ...]),
// stopping at `longestLength`. The actual letters don't need to be real
// dictionary words — stats rendering never re-validates them, only game.js's
// live guess submission does (see wordChecker.js's validateWord).
function makeWords(longestLength, wordLength_start = 4) {
	const words = new Array(wordLength_start).fill(null);
	for (let length = wordLength_start; length <= longestLength; length++) {
		words.push("X".repeat(length));
	}
	return words;
}

// Same shape as makeWords(), but each word is built as `trigram` + filler,
// so it actually contains the trigram (like every real guess must — see
// wordChecker.js's containsTrigram) — needed for the current-game fixture,
// since only its words get rendered into "Your Words" at all.
function makeWordsContaining(trigram, longestLength) {
	const wordLength_start = 4;
	const words = new Array(wordLength_start).fill(null);
	for (let length = wordLength_start; length <= longestLength; length++) {
		words.push(trigram + "X".repeat(length - trigram.length));
	}
	return words;
}
