// Pure data logic for the Browse view (browse.js) — no DOM, no Firestore — so
// it can be unit-tested (tests/unit/browse-data.test.js).

export const MIN_LEN = 4;
export const MAX_LEN = 15;

// Mirrors tools/utils/make_trigram_dict_json.py: a trigram's word list is every
// corpus word of length 4-15 containing it. One pass over the corpus, counting
// each word once per distinct trigram it contains, is ~2M steps for 266k words -
// far cheaper than filtering the whole corpus once per trigram (1,951 passes).
export function countWords(wordsByLength) {
	const counts = {};
	for (let len = MIN_LEN; len <= MAX_LEN; len++) {
		for (const word of wordsByLength[len] || []) {
			const seen = new Set();
			for (let i = 0; i + 3 <= word.length; i++) seen.add(word.slice(i, i + 3));
			for (const tri of seen) {
				const c = (counts[tri] ||= { total: 0, byLen: {} });
				c.total++;
				c.byLen[len] = (c.byLen[len] || 0) + 1;
			}
		}
	}
	return counts;
}

export function wordsFor(trigram, wordsByLength) {
	const out = {};
	for (let len = MIN_LEN; len <= MAX_LEN; len++) {
		const list = (wordsByLength[len] || []).filter((w) => w.includes(trigram));
		if (list.length) out[len] = list;
	}
	return out;
}

// DONE/SCHEDULED come from the calendar, never from a stored label: the calendar
// is what the game actually plays, so it can't drift the way the sheet did.
export function buildRows(trigrams, labels, calendar, currentWeek, counts) {
	const weekOf = new Map(calendar.map((t, i) => [t.toUpperCase(), i]));
	return trigrams.map((t) => {
		const week = weekOf.get(t);
		const saved = labels[t];
		let status = saved?.label || "";
		if (week !== undefined) status = week <= currentWeek ? "DONE" : "SCHEDULED";
		const byLen = counts[t]?.byLen || {};
		return {
			trigram: t,
			status,
			label: saved?.label || "",
			comment: saved?.comment || "",
			labeledAt: toDate(saved?.labeledAt),
			week,
			words: counts[t]?.total || 0,
			byLen,
			...fewestWords(byLen),
		};
	});
}

// The game has one level per word length (4-15), so a trigram is only as good
// as its thinnest length: 1 word there is likely an obscure one players can't
// find, and 0 means that level can't be played at all.
export function fewestWords(byLen) {
	let minWords = Infinity;
	let minLens = [];
	for (let len = MIN_LEN; len <= MAX_LEN; len++) {
		const n = byLen[len] || 0;
		if (n < minWords) {
			minWords = n;
			minLens = [len];
		} else if (n === minWords) {
			minLens.push(len);
		}
	}
	return { minWords, minLens };
}

// Comment written by Browse's 🚩 flag on a word-length group, e.g.
// "4-letter (1): ABOS". Capped so a big group doesn't bury the comment; added
// after any existing comment instead of replacing it.
export const FLAG_WORDS_SHOWN = 5;

export function flagComment(len, words, existing = "") {
	const shown = words.slice(0, FLAG_WORDS_SHOWN).join(", ");
	const more = words.length > FLAG_WORDS_SHOWN ? ` +${words.length - FLAG_WORDS_SHOWN}` : "";
	const note = `${len}-letter (${words.length}): ${shown}${more}`;
	const prev = existing.trim();
	if (!prev) return note;
	return prev.includes(note) ? prev : `${prev}; ${note}`;
}

function toDate(v) {
	if (!v) return null;
	if (v instanceof Date) return v;
	if (typeof v.toDate === "function") return v.toDate(); // Firestore Timestamp
	return null;
}

// Filter "UNLABELED" = nothing decided yet and not in the calendar.
export function filterRows(rows, { query = "", status = "ALL" } = {}) {
	const q = query.trim().toUpperCase();
	return rows.filter(
		(r) =>
			(!q || r.trigram.includes(q)) &&
			(status === "ALL" ||
				(status === "UNLABELED" ? r.status === "" : r.status === status)),
	);
}

const STATUS_ORDER = { YES: 0, MAYBE: 1, "": 2, NO: 3, SCHEDULED: 4, DONE: 5 };

export function sortRows(rows, key, dir = 1) {
	const val = {
		trigram: (r) => r.trigram,
		status: (r) => STATUS_ORDER[r.status],
		words: (r) => r.words,
		minWords: (r) => r.minWords,
		comment: (r) => r.comment.toLowerCase(),
		labeledAt: (r) => (r.labeledAt ? r.labeledAt.getTime() : 0),
	}[key];
	return [...rows].sort((a, b) => {
		const x = val(a);
		const y = val(b);
		if (x < y) return -dir;
		if (x > y) return dir;
		return a.trigram < b.trigram ? -1 : 1; // stable, readable tiebreak
	});
}

export function summarize(rows, calendar, currentWeek) {
	const n = (s) => rows.filter((r) => r.status === s).length;
	return {
		yes: n("YES"),
		maybe: n("MAYBE"),
		no: n("NO"),
		unlabeled: n(""),
		scheduledWeeks: Math.max(0, calendar.length - 1 - currentWeek),
	};
}

const csvCell = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

export function toCsv(rows) {
	const lines = [["Trigram", "Status", "Comment", "Fewest words", "At length", "Labeled"]];
	for (const r of rows) {
		lines.push([
			r.trigram,
			r.status,
			r.comment,
			String(r.minWords),
			r.minLens.join(" "),
			r.labeledAt ? r.labeledAt.toISOString().slice(0, 10) : "",
		]);
	}
	return lines.map((l) => l.map(csvCell).join(",")).join("\n") + "\n";
}
