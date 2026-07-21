// Generates the 12 near-identical .level blocks (word lengths 4-15,
// grouped into rounds of 3 — mirroring the round-number grouping
// view.js's handleLevelStarted assumes) instead of hand-typing them.
//
// A module, same as everything else — but positioned before ui/view.js's
// <script> tag in index.html, and that ordering is load-bearing: deferred
// module scripts (this one included) run in document order, and view.js
// queries .round/.level elements at its own top level, so they need to
// already exist by the time it runs, not just by DOMContentLoaded.
//
// Letters render empty — CSS already hides unfilled/locked letters, and
// width is a fixed calc(), not content-dependent.
import { WORD_LENGTH_START, WORD_LENGTH_MAX, LEVELS_PER_ROUND } from "../constants.js";

const gameDiv = document.getElementById("game");

for (
	let roundStart = WORD_LENGTH_START;
	roundStart <= WORD_LENGTH_MAX;
	roundStart += LEVELS_PER_ROUND
) {
	const roundDiv = document.createElement("div");
	roundDiv.className = "round";

	const roundEnd = Math.min(roundStart + LEVELS_PER_ROUND - 1, WORD_LENGTH_MAX);
	for (let length = roundStart; length <= roundEnd; length++) {
		const levelDiv = document.createElement("div");
		levelDiv.id = "level-" + length;
		levelDiv.className = "level locked";

		const lengthDiv = document.createElement("div");
		lengthDiv.id = "length-" + length;
		lengthDiv.className = "length";
		lengthDiv.textContent = length;
		levelDiv.appendChild(lengthDiv);

		const wordDiv = document.createElement("div");
		wordDiv.id = "word-" + length;
		wordDiv.className = "word";
		for (let i = 0; i < length; i++) {
			const letterDiv = document.createElement("div");
			letterDiv.className = "letter";
			wordDiv.appendChild(letterDiv);
		}
		levelDiv.appendChild(wordDiv);

		roundDiv.appendChild(levelDiv);
	}
	gameDiv.appendChild(roundDiv);
}
