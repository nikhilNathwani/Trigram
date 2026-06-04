import { firebaseConfig } from "/tools/label/firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
	getFirestore,
	collection,
	doc,
	setDoc,
	getDocs,
	serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── Firebase ──────────────────────────────────────────────────
const db = getFirestore(initializeApp(firebaseConfig));

// ── State ─────────────────────────────────────────────────────
const S = {
	allTrigrams: [],
	doneTrigrams: new Set(),
	labels: {},
	queue: [],
	queueIndex: 0,
	wordCache: {},
};

const LENGTH_ORDER = [
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"11",
	"12",
	"13",
	"14",
	"15",
];

// ── DOM refs ──────────────────────────────────────────────────
const wordArea = document.getElementById("word-area");
const trigramDisp = document.getElementById("trigram-display");
const progressDisp = document.getElementById("progress-display");
const actionBtns = document.getElementById("action-btns");
const promptEl = document.getElementById("prompt");
const promptMsg = document.getElementById("prompt-msg");
const promptInput = document.getElementById("prompt-input");
const promptConfirm = document.getElementById("prompt-confirm");
const promptCancel = document.getElementById("prompt-cancel");

// ── Auto-scroll ───────────────────────────────────────────────
let animFrame = null;
let manualSpeed = null; // null = auto-scroll, number = manual override (hold buttons or touch)

function startAutoScroll() {
	cancelAnimationFrame(animFrame);
	let last = null;
	function step(ts) {
		if (last == null) last = ts;
		const dt = Math.min(ts - last, 50);
		last = ts;
		const speed = manualSpeed !== null ? manualSpeed : 1.2;
		wordArea.scrollTop += speed * (dt / 16);
		animFrame = requestAnimationFrame(step);
	}
	animFrame = requestAnimationFrame(step);
}

function stopAutoScroll() {
	cancelAnimationFrame(animFrame);
	animFrame = null;
}

function setupHoldButton(el, speed) {
	el.addEventListener("pointerdown", () => {
		manualSpeed = speed;
	});
	el.addEventListener("pointerup", () => {
		manualSpeed = null;
	});
	el.addEventListener("pointerleave", () => {
		manualSpeed = null;
	});
}

setupHoldButton(document.getElementById("btn-forward"), 8);

// Tap word area to toggle pause/resume
let paused = false;
wordArea.addEventListener(
	"click",
	() => {
		paused = !paused;
		if (paused) {
			manualSpeed = 0;
		} else {
			manualSpeed = null;
		}
	},
	{ passive: true },
);

// Stored section scroll positions (populated when word list DOM is built)
let sectionTops = [];

document.getElementById("btn-rewind").addEventListener("click", () => {
	if (!sectionTops.length) return;
	const scrollTop = wordArea.scrollTop;
	// Find the last section that starts strictly before current scroll
	let currentIdx = 0;
	for (let i = 0; i < sectionTops.length; i++) {
		if (sectionTops[i] <= scrollTop + 2) currentIdx = i;
	}
	// Jump back one section (or stay at first)
	const prevIdx = Math.max(0, currentIdx - 1);
	wordArea.scrollTop = sectionTops[prevIdx];
});

document.getElementById("btn-jump").addEventListener("click", () => {
	if (!sectionTops.length) return;
	const scrollTop = wordArea.scrollTop;
	let currentIdx = 0;
	for (let i = 0; i < sectionTops.length; i++) {
		if (sectionTops[i] <= scrollTop + 2) currentIdx = i;
	}
	const nextIdx = currentIdx + 1;
	if (nextIdx < sectionTops.length) {
		wordArea.scrollTop = sectionTops[nextIdx];
	}
});

// ── Data loading ──────────────────────────────────────────────
async function loadFast() {
	// Load only the static CDN files — fast, no Firestore blocking
	const [triText, calData] = await Promise.all([
		fetch("/tools/label/trigrams.txt").then((r) => r.text()),
		fetch("/data/trigram_calendar.json").then((r) => r.json()),
	]);
	S.allTrigrams = triText
		.split("\n")
		.map((t) => t.trim().toUpperCase())
		.filter(Boolean);
	S.doneTrigrams = new Set(calData.map((t) => t.toUpperCase()));
}

async function loadLabels() {
	const snap = await getDocs(collection(db, "trigrams"));
	S.labels = {};
	snap.forEach((d) => {
		S.labels[d.id] = d.data();
	});
}

async function loadWords(trigram) {
	if (S.wordCache[trigram] !== undefined) return S.wordCache[trigram];
	try {
		const res = await fetch(
			`/data/trigram-word-lists/${trigram.toLowerCase()}_words.json`,
		);
		S.wordCache[trigram] = res.ok ? await res.json() : null;
	} catch {
		S.wordCache[trigram] = null;
	}
	return S.wordCache[trigram];
}

async function saveLabel(trigram, label, comment = "") {
	const data = { label, comment, labeledAt: serverTimestamp() };
	await setDoc(doc(db, "trigrams", trigram), data);
	S.labels[trigram] = { ...data, labeledAt: new Date() };
}

// ── Queue ─────────────────────────────────────────────────────
function buildQueue() {
	const labeled = new Set(Object.keys(S.labels));
	const pool = S.allTrigrams.filter(
		(t) => !labeled.has(t) && !S.doneTrigrams.has(t),
	);
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}
	S.queue = pool;
	S.queueIndex = 0;
}

function skipLabeled() {
	while (
		S.queueIndex < S.queue.length &&
		(S.labels[S.queue[S.queueIndex]] ||
			S.doneTrigrams.has(S.queue[S.queueIndex]))
	) {
		S.queueIndex++;
	}
}

// ── Card rendering ────────────────────────────────────────────
async function showCard() {
	stopAutoScroll();
	hidePrompt();
	paused = false;
	manualSpeed = null;
	skipLabeled();

	const labeled = Object.keys(S.labels).length;
	const remaining = S.queue.length - S.queueIndex;
	progressDisp.textContent = `${labeled} labeled \u00b7 ${remaining} left`;

	if (S.queueIndex >= S.queue.length) {
		trigramDisp.textContent = "Done!";
		wordArea.innerHTML =
			'<p class="empty-state">All trigrams labeled this session.</p>';
		actionBtns.querySelectorAll("button").forEach((b) => {
			b.disabled = true;
		});
		return;
	}

	const trigram = S.queue[S.queueIndex];
	trigramDisp.textContent = trigram;
	actionBtns.querySelectorAll("button").forEach((b) => {
		b.disabled = false;
	});

	wordArea.innerHTML = '<p class="loading-msg">Loading words\u2026</p>';
	wordArea.scrollTop = 0;

	const words = await loadWords(trigram);

	if (!words) {
		wordArea.innerHTML =
			'<p class="empty-state">Word list not generated yet.<br><code>run generate_all_word_lists.sh</code></p>';
		startAutoScroll();
		return;
	}

	const frag = document.createDocumentFragment();
	sectionTops = []; // reset
	const measuringDivs = []; // collect headers for position measurement
	for (const len of LENGTH_ORDER) {
		const list = words[len] || [];
		if (!list.length) continue;
		const hdr = document.createElement("div");
		hdr.className = "len-hdr";
		hdr.textContent = `\u2500\u2500 ${len} letters (${list.length}) \u2500\u2500`;
		frag.appendChild(hdr);
		measuringDivs.push(hdr);
		for (const w of list) {
			const d = document.createElement("div");
			d.className = "word-item";
			d.textContent = w;
			frag.appendChild(d);
		}
	}
	wordArea.innerHTML = "";
	wordArea.appendChild(frag);
	// Measure positions AFTER insertion (layout is now computed)
	// Use offsetTop relative to wordArea by subtracting wordArea's own offsetTop
	const areaOffsetTop = wordArea.offsetTop;
	sectionTops = measuringDivs.map((h) => h.offsetTop - areaOffsetTop);
	startAutoScroll();
}

// ── Prompt helpers ────────────────────────────────────────────
function showPrompt(msg, needInput) {
	stopAutoScroll();
	actionBtns.hidden = true;
	promptEl.hidden = false;
	promptMsg.textContent = msg;
	promptInput.hidden = !needInput;
	promptInput.value = "";
	promptInput.style.borderColor = "";
	if (needInput) promptInput.focus();
}

function hidePrompt() {
	promptEl.hidden = true;
	actionBtns.hidden = false;
	promptInput.hidden = true;
	promptInput.value = "";
}

// ── Action buttons ────────────────────────────────────────────
let pendingLabel = null;

document.getElementById("btn-yes").onclick = () => {
	pendingLabel = "YES";
	showPrompt("Label as YES \u2014 are you sure?", false);
};

document.getElementById("btn-no").onclick = () => {
	pendingLabel = "NO";
	showPrompt("Why NO? (required):", true);
};

document.getElementById("btn-maybe").onclick = () => {
	pendingLabel = "MAYBE";
	showPrompt("Why MAYBE? (required):", true);
};

promptConfirm.onclick = async () => {
	if (pendingLabel === "NO" || pendingLabel === "MAYBE") {
		const reason = promptInput.value.trim();
		if (!reason) {
			promptInput.style.borderColor = pendingLabel === "NO" ? "var(--c-no)" : "var(--c-maybe)";
			promptInput.focus();
			return;
		}
		const trigram = S.queue[S.queueIndex];
		hidePrompt();
		await saveLabel(trigram, pendingLabel, reason);
	} else {
		const trigram = S.queue[S.queueIndex];
		hidePrompt();
		await saveLabel(trigram, pendingLabel);
	}
	pendingLabel = null;
	S.queueIndex++;
	showCard();
};

promptCancel.onclick = () => {
	pendingLabel = null;
	hidePrompt();
	startAutoScroll();
};

// ── Bootstrap ─────────────────────────────────────────────────
(async () => {
	try {
		// Fast path: load CDN data and show first card immediately
		await loadFast();
		buildQueue();
		await showCard();
		// Slow path: load Firestore labels in background, then rebuild queue
		await loadLabels();
		buildQueue();
		// Update progress display without re-rendering the current card
		const labeled = Object.keys(S.labels).length;
		const remaining = S.queue.length - S.queueIndex;
		progressDisp.textContent = `${labeled} labeled \u00b7 ${remaining} left`;
	} catch (err) {
		console.error(err);
		document.body.innerHTML = `<p style="padding:2rem;color:red">Error: ${err.message}</p>`;
	}
})();
