import { db, requireSignIn } from "/tools/label/firebase.js";
import { getGameID } from "/app/js/calendar.js";
import {
	MIN_LEN,
	MAX_LEN,
	countWords,
	wordsFor,
	buildRows,
	filterRows,
	sortRows,
	summarize,
	toCsv,
} from "/tools/label/browse-data.js";
import {
	collection,
	doc,
	setDoc,
	deleteDoc,
	getDocs,
	serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Browse replaces the old Google Sheet: Firestore "trigrams" is the only place
// labels live (same doc shape the label queue in app.js writes), and
// DONE/SCHEDULED are derived from data/trigram_calendar.json.

// ── State ─────────────────────────────────────────────────────
const S = {
	trigrams: [],
	calendar: [],
	currentWeek: getGameID(),
	labels: {},
	corpus: null, // { 4: [...words], ..., 15: [...] } once loaded
	counts: {},
	rows: [],
	query: "",
	status: "ALL",
	sortKey: "trigram",
	sortDir: 1,
	expanded: new Set(),
};

const FILTERS = ["ALL", "UNLABELED", "YES", "MAYBE", "NO", "SCHEDULED", "DONE"];
const EDITABLE = ["", "YES", "MAYBE", "NO"];
const KEY_LABELS = { y: "YES", m: "MAYBE", n: "NO" };

// ── DOM refs ──────────────────────────────────────────────────
const tbody = document.querySelector("#browse-table tbody");
const thead = document.querySelector("#browse-table thead");
const summaryEl = document.getElementById("browse-summary");
const statusEl = document.getElementById("browse-status");
const searchEl = document.getElementById("browse-search");
const filtersEl = document.getElementById("browse-filters");

function setStatus(msg, isError = false) {
	statusEl.textContent = msg;
	statusEl.classList.toggle("error", isError);
}

// ── Data loading ──────────────────────────────────────────────
async function loadBasics() {
	const [triText, calendar, snap] = await Promise.all([
		fetch("/tools/label/trigrams.txt").then((r) => r.text()),
		fetch("/data/trigram_calendar.json").then((r) => r.json()),
		getDocs(collection(db, "trigrams")),
	]);
	S.trigrams = triText
		.split("\n")
		.map((t) => t.trim().toUpperCase())
		.filter(Boolean);
	S.calendar = calendar.map((t) => t.toUpperCase());
	snap.forEach((d) => {
		S.labels[d.id] = d.data();
	});
}

// Same dictionary files the word-list generator reads, so counts here match
// what add_new_trigram.sh would produce.
async function loadCorpus() {
	const lens = [];
	for (let len = MIN_LEN; len <= MAX_LEN; len++) lens.push(len);
	const texts = await Promise.all(
		lens.map((len) =>
			fetch(`/data/corpus/sowpods_${len}.txt`).then((r) => r.text()),
		),
	);
	const corpus = {};
	lens.forEach((len, i) => {
		corpus[len] = texts[i]
			.split("\n")
			.map((w) => w.trim())
			.filter(Boolean);
	});
	S.corpus = corpus;
	S.counts = countWords(corpus);
}

function rebuildRows() {
	S.rows = buildRows(S.trigrams, S.labels, S.calendar, S.currentWeek, S.counts);
}

// ── Rendering ─────────────────────────────────────────────────
function weekDate(week) {
	const d = new Date("2024-04-15T00:00:00"); // gameStartDate in app/js/calendar.js
	d.setDate(d.getDate() + week * 7);
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
}

function renderSummary() {
	const s = summarize(S.rows, S.calendar, S.currentWeek);
	const lastWeek = S.calendar.length - 1;
	summaryEl.textContent =
		`${s.yes} unused YES · ${s.maybe} MAYBE · ${s.no} NO · ${s.unlabeled} unlabeled · ` +
		`scheduled ${s.scheduledWeeks} week${s.scheduledWeeks === 1 ? "" : "s"} ahead (through ${weekDate(lastWeek)})`;
}

function renderFilters() {
	const count = (f) => filterRows(S.rows, { status: f }).length;
	filtersEl.innerHTML = FILTERS.map(
		(f) =>
			`<button type="button" class="chip${f === S.status ? " active" : ""}" data-filter="${f}">` +
			`${f === "ALL" ? "All" : f === "UNLABELED" ? "Unlabeled" : f} ${count(f)}</button>`,
	).join("");
}

function renderHead() {
	thead.querySelectorAll("th").forEach((th) => {
		const on = th.dataset.sort === S.sortKey;
		th.classList.toggle("sorted", on);
		th.dataset.dir = on ? (S.sortDir === 1 ? "▲" : "▼") : "";
	});
}

function esc(s) {
	return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function rowHtml(r) {
	const locked = r.status === "DONE" || r.status === "SCHEDULED";
	const labelCell = locked
		? `<span class="label-badge badge-done">${r.status}</span> <span class="wk">#${r.week + 1} · ${weekDate(r.week)}</span>`
		: `<select class="label-select sel-${(r.label || "none").toLowerCase()}" aria-label="Label for ${r.trigram}">` +
			EDITABLE.map(
				(l) => `<option value="${l}"${l === r.label ? " selected" : ""}>${l || "—"}</option>`,
			).join("") +
			`</select>`;
	const words = S.corpus
		? `<span class="wc">${r.words}</span>`
		: `<span class="wc muted">…</span>`;
	const date = r.labeledAt ? r.labeledAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" }) : "";
	return (
		`<tr data-t="${r.trigram}" tabindex="0" class="${S.expanded.has(r.trigram) ? "open" : ""}">` +
		`<td class="tri"><button type="button" class="expand" aria-label="Show words for ${r.trigram}">${S.expanded.has(r.trigram) ? "▾" : "▸"}</button>${r.trigram}</td>` +
		`<td class="lbl">${labelCell}</td>` +
		`<td class="num">${words}</td>` +
		`<td class="cmt"><input class="comment-cell" value="${esc(r.comment)}" aria-label="Comment for ${r.trigram}"${locked ? " disabled" : ""}></td>` +
		`<td class="date">${date}</td>` +
		`</tr>` +
		(S.expanded.has(r.trigram) ? detailHtml(r) : "")
	);
}

function detailHtml(r) {
	if (!S.corpus) return `<tr class="detail"><td colspan="5">Loading dictionary…</td></tr>`;
	const words = wordsFor(r.trigram, S.corpus);
	const lens = Object.keys(words);
	if (!lens.length) return `<tr class="detail"><td colspan="5">No 4–15 letter words contain ${r.trigram}.</td></tr>`;
	return (
		`<tr class="detail"><td colspan="5">` +
		lens
			.map(
				(len) =>
					`<div class="len-group"><div class="len-title">${len} letters (${words[len].length})</div>` +
					words[len].map((w) => `<span class="word-chip">${w}</span>`).join(" ") +
					`</div>`,
			)
			.join("") +
		`</td></tr>`
	);
}

function visibleRows() {
	return sortRows(filterRows(S.rows, { query: S.query, status: S.status }), S.sortKey, S.sortDir);
}

function render() {
	const rows = visibleRows();
	tbody.innerHTML = rows.length
		? rows.map(rowHtml).join("")
		: `<tr class="detail"><td colspan="5">No trigrams match.</td></tr>`;
	renderHead();
	renderFilters();
	renderSummary();
}

// Re-render one trigram in place so editing doesn't reshuffle the table (a row
// that stops matching the filter stays put until the filter changes).
function rerenderRow(trigram) {
	const tr = tbody.querySelector(`tr[data-t="${trigram}"]`);
	if (!tr) return;
	const next = tr.nextElementSibling;
	if (next?.classList.contains("detail")) next.remove();
	const r = S.rows.find((x) => x.trigram === trigram);
	tr.insertAdjacentHTML("afterend", rowHtml(r));
	tr.remove();
	renderFilters();
	renderSummary();
	return tbody.querySelector(`tr[data-t="${trigram}"]`);
}

// ── Saving ────────────────────────────────────────────────────
async function save(trigram, label, comment) {
	const prev = S.labels[trigram];
	try {
		if (label) {
			const data = { label, comment, labeledAt: serverTimestamp() };
			await setDoc(doc(db, "trigrams", trigram), data);
			S.labels[trigram] = { ...data, labeledAt: new Date() };
			setStatus(`Saved ${trigram} → ${label}${comment ? ` (“${comment}”)` : ""}`);
		} else {
			await deleteDoc(doc(db, "trigrams", trigram));
			delete S.labels[trigram];
			setStatus(`Cleared ${trigram} (back in the label queue)`);
		}
	} catch (err) {
		console.error(err);
		S.labels[trigram] = prev;
		setStatus(`Couldn’t save ${trigram}: ${err.message}`, true);
	}
	rebuildRows();
	return rerenderRow(trigram);
}

// ── Events ────────────────────────────────────────────────────
searchEl.addEventListener("input", () => {
	searchEl.value = searchEl.value.toUpperCase().replace(/[^A-Z]/g, "");
	S.query = searchEl.value;
	render();
});

filtersEl.addEventListener("click", (e) => {
	const f = e.target.closest("[data-filter]")?.dataset.filter;
	if (!f) return;
	S.status = f;
	render();
});

thead.addEventListener("click", (e) => {
	const key = e.target.closest("th")?.dataset.sort;
	if (!key) return;
	// Words and Labeled read most naturally biggest/newest first
	S.sortDir = key === S.sortKey ? -S.sortDir : key === "words" || key === "labeledAt" ? -1 : 1;
	S.sortKey = key;
	render();
});

tbody.addEventListener("click", (e) => {
	const btn = e.target.closest(".expand");
	if (!btn) return;
	const t = btn.closest("tr").dataset.t;
	S.expanded.has(t) ? S.expanded.delete(t) : S.expanded.add(t);
	rerenderRow(t)?.focus();
});

tbody.addEventListener("change", async (e) => {
	const tr = e.target.closest("tr[data-t]");
	if (!tr) return;
	const t = tr.dataset.t;
	const current = S.labels[t];
	if (e.target.classList.contains("label-select")) {
		(await save(t, e.target.value, e.target.value ? current?.comment || "" : ""))
			?.querySelector(".label-select")
			?.focus();
	} else if (e.target.classList.contains("comment-cell")) {
		const comment = e.target.value.trim();
		if (!current) {
			setStatus(`Pick a label for ${t} before adding a comment.`, true);
			e.target.value = "";
			return;
		}
		if (comment !== (current.comment || "")) await save(t, current.label, comment);
	}
});

// Keyboard: ↑/↓ move between rows, Y/M/N label the focused row, Delete clears,
// Enter shows/hides words — only when the row itself (not a field) has focus.
tbody.addEventListener("keydown", async (e) => {
	const tr = e.target;
	if (!tr.matches?.("tr[data-t]")) {
		if (e.key === "Enter" && e.target.classList.contains("comment-cell")) e.target.blur();
		return;
	}
	const t = tr.dataset.t;
	const row = S.rows.find((x) => x.trigram === t);
	const locked = row.status === "DONE" || row.status === "SCHEDULED";
	const move = (dir) => {
		let n = dir > 0 ? tr.nextElementSibling : tr.previousElementSibling;
		while (n && !n.dataset.t) n = dir > 0 ? n.nextElementSibling : n.previousElementSibling;
		n?.focus();
	};
	const key = e.key.toLowerCase();
	if (e.key === "ArrowDown" || e.key === "ArrowUp") {
		e.preventDefault();
		move(e.key === "ArrowDown" ? 1 : -1);
	} else if (e.key === "Enter") {
		S.expanded.has(t) ? S.expanded.delete(t) : S.expanded.add(t);
		rerenderRow(t)?.focus();
	} else if (!locked && KEY_LABELS[key] && !e.metaKey && !e.ctrlKey) {
		(await save(t, KEY_LABELS[key], S.labels[t]?.comment || ""))?.focus();
	} else if (!locked && (e.key === "Delete" || e.key === "Backspace") && S.labels[t]) {
		e.preventDefault();
		(await save(t, "", ""))?.focus();
	}
});

document.getElementById("browse-export").addEventListener("click", () => {
	const blob = new Blob([toCsv(visibleRows())], { type: "text/csv" });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = `trigrams-${new Date().toISOString().slice(0, 10)}.csv`;
	a.click();
	URL.revokeObjectURL(a.href);
});

// Column headers stick just below the (variable-height, sticky) page header.
new ResizeObserver(([entry]) => {
	document.documentElement.style.setProperty(
		"--browse-hdr-h",
		`${entry.target.getBoundingClientRect().height}px`,
	);
}).observe(document.getElementById("browse-hdr"));

// ── Bootstrap ─────────────────────────────────────────────────
(async () => {
	try {
		const corpusLoaded = loadCorpus(); // public files: fetch while signing in
		await requireSignIn();
		await loadBasics();
		rebuildRows();
		render();
		setStatus("Loading dictionary for word counts…");
		await corpusLoaded;
		rebuildRows();
		render();
		setStatus("");
	} catch (err) {
		console.error(err);
		setStatus(`Error: ${err.message}`, true);
	}
})();
