import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { loadAppScript } from "./helpers/loadAppScript.js";

// storage.js is the localStorage read/write layer. Vitest's jsdom
// environment provides a real (in-memory) localStorage implementation, so
// these tests exercise the exact same API calls the browser would run —
// no mocking needed for storage itself, only for "today's date" (via
// getGameID, which storage.js calls to know which save-slot is current).
describe("storage", () => {
	beforeAll(() => {
		globalThis.DEBUG = { forceNewGame: false, forceFakePastStats: false };
		loadAppScript("calendar.js"); // storage.js calls getGameID() from here
		loadAppScript("storage.js");
	});

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

		it("excludes the current game and ignores non-game keys", () => {
			localStorage.setItem(
				"0",
				JSON.stringify({ trigram: "CAT", wordsProvided: [null, "CATS"] })
			);
			localStorage.setItem(
				"1",
				JSON.stringify({ trigram: "DOG", wordsProvided: [null, "DOGS", "DOGES"] })
			);
			// Keys that aren't purely numeric should be ignored, e.g. app
			// settings or feature flags stored under the same localStorage.
			localStorage.setItem("some-unrelated-setting", "true");

			const pastGames = loadPastGames();

			expect(pastGames).toEqual([
				{ gameID: 0, trigram: "CAT", longestWord: 4 }, // "CATS".length
				{ gameID: 1, trigram: "DOG", longestWord: 5 }, // "DOGES".length
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
