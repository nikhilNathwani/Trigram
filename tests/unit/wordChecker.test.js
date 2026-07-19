import { beforeAll, describe, expect, it, vi } from "vitest";
import { loadAppScript } from "./helpers/loadAppScript.js";

// wordChecker.js is pure validation logic: given a word, the week's
// trigram, the expected word length, and the current word list, decide
// whether the guess is legal. Every function here is a true pure function —
// wordList is passed in as a parameter rather than read from module-private
// state, so tests can just call a function and check what came back, with
// no setup, no mocking, and no dependency on what any other test did first.
describe("wordChecker", () => {
	beforeAll(() => {
		loadAppScript("wordChecker.js");
	});

	const fixtureWordList = { 4: ["CATS", "PITA"], 5: ["CATER"] };

	describe("isWordLengthReached", () => {
		it("is true when the word matches the required length", () => {
			expect(isWordLengthReached("CATS", 4)).toBe(true);
		});

		it("is false when the word is shorter or longer than required", () => {
			expect(isWordLengthReached("CAT", 4)).toBe(false);
			expect(isWordLengthReached("CATERS", 4)).toBe(false);
		});
	});

	describe("containsTrigram", () => {
		it("is true when the trigram appears anywhere in the word", () => {
			expect(containsTrigram("CATS", "CAT")).toBe(true);
			expect(containsTrigram("SCATTER", "CAT")).toBe(true);
		});

		it("is false when the trigram is absent", () => {
			expect(containsTrigram("DOGS", "CAT")).toBe(false);
		});
	});

	describe("existsInWordList", () => {
		it("is true for a word present at that length in the word list", () => {
			expect(existsInWordList("CATS", 4, fixtureWordList)).toBe(true);
		});

		it("is false for a word not present at that length", () => {
			expect(existsInWordList("DOGS", 4, fixtureWordList)).toBe(false);
		});

		it("is false when no bucket exists for that word length", () => {
			expect(existsInWordList("CATERS", 7, fixtureWordList)).toBe(false);
		});

		it("is false (not a throw) when no word list has been loaded yet", () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});

			expect(existsInWordList("CATS", 4, null)).toBe(false);
			expect(spy).toHaveBeenCalledWith("Word list not loaded.");

			spy.mockRestore();
		});
	});

	// validateWord() is the function actually called by game.js on every
	// guess, so it's worth testing every branch a player can hit, in the
	// same priority order the real function checks them in.
	describe("validateWord", () => {
		it("returns WRONG-LENGTH before checking anything else", () => {
			expect(validateWord("CAT", "CAT", 4, fixtureWordList)).toEqual([
				false,
				"WRONG-LENGTH",
			]);
		});

		it("returns TRIGRAM-MISSING for a correctly-sized word without the trigram", () => {
			expect(validateWord("DOGS", "CAT", 4, fixtureWordList)).toEqual([
				false,
				"TRIGRAM-MISSING",
			]);
		});

		it("returns NOT-FOUND for a word that is the right shape but not in the dictionary", () => {
			expect(validateWord("CATE", "CAT", 4, fixtureWordList)).toEqual([
				false,
				"NOT-FOUND",
			]);
		});

		it("returns [true, ''] for a fully valid guess", () => {
			expect(validateWord("CATS", "CAT", 4, fixtureWordList)).toEqual([
				true,
				"",
			]);
		});
	});

	// loadWordList() is the one function here with a real side effect (a
	// network call), so unlike everything above, it does need `fetch`
	// mocked — but now that's scoped to just these two tests instead of
	// leaking into every test in the file.
	describe("loadWordList", () => {
		it("resolves with the parsed word list on success", async () => {
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue({
					json: () => Promise.resolve(fixtureWordList),
				})
			);

			await expect(loadWordList("cat")).resolves.toEqual(fixtureWordList);
			expect(fetch).toHaveBeenCalledWith(
				"data/trigram-word-lists/cat_words.json"
			);
		});

		it("logs and rejects when the fetch fails", async () => {
			const networkError = new Error("network down");
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(networkError));
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(loadWordList("cat")).rejects.toBe(networkError);
			expect(spy).toHaveBeenCalledWith("Error loading word list:", networkError);

			spy.mockRestore();
		});
	});
});
