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
let manualSpeed = null; // null = auto-scroll, number = manual override
let userScrolling = false;
let userScrollTimer = null;

// Pause auto-scroll when user manually scrolls
wordArea.addEventListener(
	"touchstart",
	() => {
		userScrolling = true;
		clearTimeout(userScrollTimer);
	},
	{ passive: true },
);
wordArea.addEventListener(
	"touchend",
	() => {
		// Resume auto-scroll 2s after user lifts finger
		clearTimeout(userScrollTimer);
		userScrollTimer = setTimeout(() => {
			userScrolling = false;
		}, 2000);
	},
	{ passive: true },
);

function startAutoScroll() {
	cancelAnimationFrame(animFrame);
	let last = null;
	function step(ts) {
		if (last == null) last = ts;
		const dt = Math.min(ts - last, 50);
		last = ts;
		if (manualSpeed !== null) {
			wordArea.scrollTop += manualSpeed * (dt / 16);
		} else if (!userScrolling) {
			wordArea.scrollTop += 0.4 * (dt / 16);
		}
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

setupHoldButton(document.getElementById("btn-rewind"), -5);
setupHoldButton(document.getElementById("btn-forward"), 5);

document.getElementById("btn-jump").addEventListener("click", () => {
	const headers = [...wordArea.querySelectorAll(".len-hdr")];
	if (!headers.length) return;
	const areaTop = wordArea.getBoundingClientRect().top;
	// Find the first header whose top edge is clearly below the visible top
	// (more than 60px below areaTop means it hasn't scrolled past yet)
	const next = headers.find(
		(h) => h.getBoundingClientRect().top - areaTop > 60,
	);
	if (next) {
		// Scroll so the header lands ~80px below the top of the area (a couple words above it visible)
		const targetScroll =
			wordArea.scrollTop +
			(next.getBoundingClientRect().top - areaTop) -
			80;
		wordArea.scrollTop = Math.max(0, targetScroll);
	}
});

// ── Data loading ──────────────────────────────────────────────
async function loadAll() {
	const [triText, calData, snap] = await Promise.all([
		fetch("/tools/label/trigrams.txt").then((r) => r.text()),
		fetch("/data/trigram_calendar.json").then((r) => r.json()),
		getDocs(collection(db, "trigrams")),
	]);
	S.allTrigrams = triText
		.split("\n")
		.map((t) => t.trim().toUpperCase())
		.filter(Boolean);
	S.doneTrigrams = new Set(calData.map((t) => t.toUpperCase()));
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
	for (const len of LENGTH_ORDER) {
		const list = words[len] || [];
		if (!list.length) continue;
		const hdr = document.createElement("div");
		hdr.className = "len-hdr";
		hdr.textContent = `\u2500\u2500 ${len} letters (${list.length}) \u2500\u2500`;
		frag.appendChild(hdr);
		for (const w of list) {
			const d = document.createElement("div");
			d.className = "word-item";
			d.textContent = w;
			frag.appendChild(d);
		}
	}
	wordArea.innerHTML = "";
	wordArea.appendChild(frag);
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

document.getElementById("btn-maybe").onclick = async () => {
	const trigram = S.queue[S.queueIndex];
	actionBtns.querySelectorAll("button").forEach((b) => {
		b.disabled = true;
	});
	await saveLabel(trigram, "MAYBE");
	S.queueIndex++;
	showCard();
};

promptConfirm.onclick = async () => {
	if (pendingLabel === "NO") {
		const reason = promptInput.value.trim();
		if (!reason) {
			promptInput.style.borderColor = "var(--c-no)";
			promptInput.focus();
			return;
		}
		const trigram = S.queue[S.queueIndex];
		hidePrompt();
		await saveLabel(trigram, "NO", reason);
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
		await loadAll();
		buildQueue();
		await showCard();
	} catch (err) {
		console.error(err);
		document.body.innerHTML = `<p style="padding:2rem;color:red">Error: ${err.message}</p>`;
	}
})();
