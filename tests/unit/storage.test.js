import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadGameState, saveGameState, loadPastGames } from "../../app/js/storage.js";

// storage.js is the localStorage read/write layer. Vitest's jsdom
// environment provides a real (in-memory) localStorage implementation, so
// these tests exercise the exact same API calls the browser would run —
// no mocking needed for storage itself, only for "today's date" (via
// getGameID, which storage.js imports from calendar.js to know which
// save-slot is current).
describe("storage", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2024-04-15T00:00:00Z")); // gameID 0
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("loadGameState", () => {
		it("returns null when nothing has been saved for today's game", () => {
			expect(loadGameState()).toBeNull();
		});

		it("returns the saved state after saveGameState has been called", () => {
			saveGameState({
				trigram: "CAT",
				lettersProvided: [null, null, null, null, "CATS"],
			});

			expect(loadGameState()).toEqual({
				trigram: "CAT",
				wordsProvided: [null, null, null, null, "CATS"],
			});
		});

		it("is scoped per game ID — a save for a different week isn't visible", () => {
			saveGameState({ trigram: "CAT", lettersProvided: ["CATS"] });

			vi.setSystemTime(new Date("2024-04-22T00:00:00Z")); // gameID 1
			expect(loadGameState()).toBeNull();
		});
	});

	describe("loadPastGames", () => {
		it("returns an empty array when localStorage has no game data", () => {
			expect(loadPastGames()).toEqual([]);
		});

		it("ignores non-game keys", () => {
			// Override the outer beforeEach's frozen date so "today" is
			// gameID 1 — leaving gameID 0 as a genuine past game, not today's.
			vi.setSystemTime(new Date("2024-04-22T00:00:00Z")); // gameID 1

			localStorage.setItem(
				"0",
				JSON.stringify({ trigram: "CAT", wordsProvided: [null, "CATS"] })
			);
			// Keys that aren't purely numeric should be ignored, e.g. app
			// settings or feature flags stored under the same localStorage.
			localStorage.setItem("some-unrelated-setting", "true");

			expect(loadPastGames()).toEqual([
				{ gameID: 0, trigram: "CAT", longestWord: 4 }, // "CATS".length
			]);
		});

		// Regression test: loadPastGames() used to scan every numeric
		// localStorage key with no exclusion at all, despite its own comment
		// claiming otherwise — so a resumed, still-in-progress game got
		// double-counted as a completed "past game" the moment it had any
		// saved progress, inflating numGamesPlayed/win %/streaks. Caught by
		// tests/e2e/statsDialog.spec.js seeding a real in-progress current
		// game alongside past-game history and checking the rendered counts.
		it("excludes the current game, even once it has saved progress", () => {
			// Override the outer beforeEach's frozen date so "today" is
			// gameID 2 — leaving room for gameID 0 to be a genuine past game.
			vi.setSystemTime(new Date("2024-04-29T00:00:00Z")); // gameID 2

			localStorage.setItem(
				"0",
				JSON.stringify({ trigram: "DOG", wordsProvided: [null, "DOGS", "DOGES"] })
			);
			localStorage.setItem(
				"2", // today's game, already has progress from an earlier session
				JSON.stringify({ trigram: "CAT", wordsProvided: [null, "CATS"] })
			);

			expect(loadPastGames()).toEqual([
				{ gameID: 0, trigram: "DOG", longestWord: 5 }, // "DOGES".length
			]);
		});

		it("returns games sorted by gameID ascending", () => {
			localStorage.setItem(
				"5",
				JSON.stringify({ trigram: "AAA", wordsProvided: [null, "AAAA"] })
			);
			localStorage.setItem(
				"2",
				JSON.stringify({ trigram: "BBB", wordsProvided: [null, "BBBB"] })
			);

			const gameIDs = loadPastGames().map((game) => game.gameID);
			expect(gameIDs).toEqual([2, 5]);
		});
	});
});
