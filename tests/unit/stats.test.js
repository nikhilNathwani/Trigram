import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ui/stats.js imports GAME_STATE and wordLength_start from game.js — but
// game.js is the app's entry point and has a top-level `initApp()` call that
// does a real fetch() and touches DOM elements this test's bare jsdom
// document doesn't have. Importing the real game.js here would try to boot
// the whole app inside a unit test.
//
// vi.mock() replaces the *entire* game.js module with this lightweight fake
// before anything imports it — including its top-level side effects, which
// simply never run. This is the standard way to cut a module out of an
// import graph for a test: not by testing around game.js's behavior, but by
// telling Vitest "when anything asks for this module, hand back this stub
// instead." Vitest hoists vi.mock() calls above the imports below
// automatically, so it takes effect before ui/stats.js is ever loaded.
//
// stats.js also subscribes to gameEvents at module load time
// (gameEvents.addEventListener(...)), so the mock needs a real EventTarget
// here too — otherwise that call throws on an undefined gameEvents.
vi.mock("../../app/js/game.js", () => ({
	GAME_STATE: {},
	wordLength_start: 4,
	gameEvents: new EventTarget(),
}));

import {
	calcCurrentStreak,
	calcLongestWord,
	calcMaxStreak,
	calcNumGamesWon,
	calcWinPercentage,
	loadStats,
} from "../../app/js/ui/stats.js";

// stats.js mixes pure math (win %, streaks, histograms) with DOM rendering.
// We only unit-test the math here — calcNumGamesWon, calcCurrentStreak, etc.
// take a plain `pastGames` array and return a number, with no DOM
// involvement, so they're testable the same way as wordChecker's functions.
//
// stats.js does run some `document.getElementById(...)` calls at the top of
// the file (e.g. `const wordListDiv = document.getElementById(...)`), but
// jsdom's getElementById just returns null for a missing element rather than
// throwing, so the file loads fine even without the real index.html markup
// present. The DOM-rendering functions themselves (setWordListUI, etc.) are
// covered separately by the Playwright E2E tests, which run against the
// real page.
describe("stats", () => {
	describe("calcNumGamesWon", () => {
		it("counts a game as won once its longest word reaches 12 letters", () => {
			const pastGames = [
				{ gameID: 0, trigram: "CAT", longestWord: 11 },
				{ gameID: 1, trigram: "DOG", longestWord: 12 },
				{ gameID: 2, trigram: "PIT", longestWord: 15 },
			];
			expect(calcNumGamesWon(pastGames)).toBe(2);
		});

		it("is 0 for an empty history", () => {
			expect(calcNumGamesWon([])).toBe(0);
		});
	});

	describe("calcMaxStreak", () => {
		it("finds the longest run of consecutive gameIDs", () => {
			// games 0,1,2 (streak of 3), then a gap, then games 5,6 (streak of 2)
			const pastGames = [
				{ gameID: 0 },
				{ gameID: 1 },
				{ gameID: 2 },
				{ gameID: 5 },
				{ gameID: 6 },
			];
			expect(calcMaxStreak(pastGames)).toBe(3);
		});

		it("is 0 for an empty history", () => {
			expect(calcMaxStreak([])).toBe(0);
		});
	});

	describe("calcCurrentStreak", () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});
		afterEach(() => {
			vi.useRealTimers();
		});

		it("counts backward from yesterday's game while games are consecutive", () => {
			// Today's live game (gameID 4) isn't itself in pastGames — it's
			// still in progress. The streak counts the 4 completed games
			// immediately preceding it: 3, 2, 1, 0.
			vi.setSystemTime(new Date("2024-05-13T00:00:00Z")); // gameID 4
			const pastGames = [
				{ gameID: 0 },
				{ gameID: 1 },
				{ gameID: 2 },
				{ gameID: 3 },
			];
			expect(calcCurrentStreak(pastGames)).toBe(4);
		});

		it("stops counting at the first gap", () => {
			vi.setSystemTime(new Date("2024-05-13T00:00:00Z")); // gameID 4
			const pastGames = [{ gameID: 0 }, { gameID: 2 }, { gameID: 3 }];
			expect(calcCurrentStreak(pastGames)).toBe(2); // games 3 and 2, then gap before 0 (gameID 1 missing)
		});

		it("is 0 when there's no game data at all", () => {
			vi.setSystemTime(new Date("2024-05-06T00:00:00Z"));
			expect(calcCurrentStreak([])).toBe(0);
		});
	});

	describe("calcLongestWord", () => {
		it("returns the longest word length across all past games", () => {
			const pastGames = [
				{ gameID: 0, longestWord: 6 },
				{ gameID: 1, longestWord: 9 },
				{ gameID: 2, longestWord: 4 },
			];
			expect(calcLongestWord(pastGames)).toBe(9);
		});

		it("is 0 for an empty history", () => {
			expect(calcLongestWord([])).toBe(0);
		});
	});

	// calcWinPercentage() reads the module-level STATS object rather than
	// taking parameters — STATS is a `const` we can't reach into from
	// outside (see TESTING_GUIDE.md §7 for why). So instead of testing
	// calcWinPercentage() directly, we drive it through loadStats(), the
	// real function that populates STATS from localStorage. This exercises
	// loadPastGames + loadStats + calcWinPercentage together, closer to how
	// they actually run in the app.
	describe("calcWinPercentage (via loadStats)", () => {
		beforeEach(() => {
			localStorage.clear();
		});

		it("is 'n/a' when no games have been played", () => {
			loadStats();
			expect(calcWinPercentage()).toBe("n/a");
		});

		it("is a whole number 100 for a perfect record", () => {
			localStorage.setItem(
				"0",
				JSON.stringify({ trigram: "CAT", wordsProvided: [null, "X".repeat(12)] })
			);
			loadStats();
			expect(calcWinPercentage()).toBe(100);
		});

		it("rounds to 1 decimal place for a typical two-digit percentage", () => {
			// 1 win out of 3 games = 33.333...% -> 33.3
			localStorage.setItem(
				"0",
				JSON.stringify({ trigram: "CAT", wordsProvided: [null, "X".repeat(12)] })
			);
			localStorage.setItem(
				"1",
				JSON.stringify({ trigram: "DOG", wordsProvided: [null, "DOGS"] })
			);
			localStorage.setItem(
				"2",
				JSON.stringify({ trigram: "PIT", wordsProvided: [null, "PITS"] })
			);
			loadStats();
			expect(calcWinPercentage()).toBe(33.3);
		});
	});
});
