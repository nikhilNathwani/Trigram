import { describe, expect, it } from "vitest";
import {
	buildRows,
	countWords,
	fewestWords,
	filterRows,
	flagComment,
	sortRows,
	summarize,
	toCsv,
	wordsFor,
} from "../../tools/label/browse-data.js";

// browse-data.js is the admin Browse view's logic with the DOM and Firestore
// stripped out. The word counts matter most: they must agree with the lists
// tools/utils/make_trigram_dict_json.py generates ("every 4-15 letter corpus
// word containing the trigram"), or Browse would mislead trigram picking.

const corpus = {
	4: ["TOAD", "DEAD", "DODE"],
	5: ["ADDED", "DEEDS"],
	6: ["DEDEDE"], // contains DED twice and EDE twice - counted once each
};

describe("countWords", () => {
	it("matches a brute-force filter for every trigram", () => {
		const counts = countWords(corpus);
		for (const tri of ["DEA", "DED", "EDE", "ADD", "TOA", "ODE", "EED"]) {
			const expected = Object.values(wordsFor(tri, corpus)).flat().length;
			expect(counts[tri]?.total || 0, tri).toBe(expected);
		}
	});

	it("counts a word once even if the trigram repeats in it", () => {
		expect(countWords(corpus).DED).toEqual({ total: 2, byLen: { 5: 1, 6: 1 } });
	});
});

describe("fewestWords", () => {
	// One level per length 4-15, so the thinnest length decides playability.
	it("finds the smallest per-length count, treating missing lengths as 0", () => {
		const full = Object.fromEntries([4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((l) => [l, 10]));
		expect(fewestWords({ ...full, 4: 1 })).toEqual({ minWords: 1, minLens: [4] });
		expect(fewestWords({ ...full, 13: 0, 15: 0 })).toEqual({ minWords: 0, minLens: [13, 15] });
		delete full[15];
		expect(fewestWords(full)).toEqual({ minWords: 0, minLens: [15] });
	});
});

describe("buildRows", () => {
	const labels = {
		ABC: { label: "YES", comment: "fun" },
		XYZ: { label: "NO", comment: "" },
		AUT: { label: "YES", comment: "" }, // labeled, then put in the calendar
	};
	const calendar = ["ONE", "TWO", "aut"];
	const rows = buildRows(["ABC", "XYZ", "AUT", "ONE", "QQQ"], labels, calendar, 1, {});
	const byT = Object.fromEntries(rows.map((r) => [r.trigram, r]));

	it("derives DONE/SCHEDULED from the calendar, overriding stored labels", () => {
		expect(byT.ONE.status).toBe("DONE"); // week 0, current week 1
		expect(byT.AUT.status).toBe("SCHEDULED"); // week 2 is in the future
		expect(byT.AUT.label).toBe("YES"); // the stored label is still kept
	});

	it("leaves unlabeled trigrams with an empty status", () => {
		expect(byT.QQQ.status).toBe("");
		expect(byT.ABC.status).toBe("YES");
	});

	it("filters by substring and status", () => {
		expect(filterRows(rows, { query: "b" }).map((r) => r.trigram)).toEqual(["ABC"]);
		expect(filterRows(rows, { status: "UNLABELED" }).map((r) => r.trigram)).toEqual(["QQQ"]);
		expect(filterRows(rows, { status: "SCHEDULED" }).map((r) => r.trigram)).toEqual(["AUT"]);
	});

	it("summarizes weeks scheduled beyond the current one", () => {
		expect(summarize(rows, calendar, 1)).toMatchObject({ yes: 1, no: 1, unlabeled: 1, scheduledWeeks: 1 });
	});
});

describe("sortRows", () => {
	const rows = [
		{ trigram: "BBB", status: "NO", words: 5, comment: "", labeledAt: null },
		{ trigram: "AAA", status: "YES", words: 9, comment: "", labeledAt: null },
		{ trigram: "CCC", status: "", words: 9, comment: "", labeledAt: null },
	];

	it("sorts by words descending with a trigram tiebreak", () => {
		expect(sortRows(rows, "words", -1).map((r) => r.trigram)).toEqual(["AAA", "CCC", "BBB"]);
	});

	it("orders labels YES, MAYBE, unlabeled, NO", () => {
		expect(sortRows(rows, "status").map((r) => r.trigram)).toEqual(["AAA", "CCC", "BBB"]);
	});
});

describe("toCsv", () => {
	it("quotes commas and quotes", () => {
		const csv = toCsv([
			{ trigram: "ABC", status: "MAYBE", comment: 'hard, "15"', minWords: 1, minLens: [4, 15], labeledAt: new Date("2026-09-26T00:00:00Z") },
		]);
		expect(csv).toBe('Trigram,Status,Comment,Fewest words,At length,Labeled\nABC,MAYBE,"hard, ""15""",1,4 15,2026-09-26\n');
	});
});

describe("flagComment", () => {
	it("names the length, count and words", () => {
		expect(flagComment(4, ["ABOS"])).toBe("4-letter (1): ABOS");
	});

	it("caps long groups and says how many more", () => {
		const words = ["A1", "A2", "A3", "A4", "A5", "A6", "A7"];
		expect(flagComment(5, words)).toBe("5-letter (7): A1, A2, A3, A4, A5 +2");
	});

	it("appends to an existing comment instead of replacing it, once", () => {
		expect(flagComment(4, ["ABOS"], "15 hard")).toBe("15 hard; 4-letter (1): ABOS");
		expect(flagComment(4, ["ABOS"], "15 hard; 4-letter (1): ABOS")).toBe("15 hard; 4-letter (1): ABOS");
	});
});
