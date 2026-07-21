// Generates the 12 near-identical .level blocks (word lengths 4-15,
// grouped into rounds of 3 — mirroring the grouping app/js/ui/view.js's
// handleLevelStarted already assumes: Math.floor(levelsCompleted / 3) + 1
// for round number) instead of hand-typing them.
//
// Loaded via a plain classic <script src="app/js/generateBoard.js"> in
// index.html — deliberately not type="module" (which would defer it until
// after the document is parsed, same as the module scripts at the end of
// <body>). A classic script tag executes synchronously in document order,
// so placing it right after <div id="game"></div> guarantees #game is
// already populated by the time ui/view.js runs — it queries .round/.level
// elements at its own top level (not just inside functions), so they need
// to exist before it's evaluated, not just before DOMContentLoaded.
//
// Letters render empty (no placeholder text) — the CSS already hides
// unfilled/locked letters (.locked .word { color: transparent }), and
// .letter's width is a fixed calc(), not content-dependent — so, unlike
// the hand-typed markup this replaced, there's no need for arbitrary
// placeholder letters purely for design-time preview.
(function () {
	var wordLengthStart = 4;
	var wordLengthMax = 15;
	var levelsPerRound = 3;
	var gameDiv = document.getElementById("game");

	for (
		var roundStart = wordLengthStart;
		roundStart <= wordLengthMax;
		roundStart += levelsPerRound
	) {
		var roundDiv = document.createElement("div");
		roundDiv.className = "round";

		var roundEnd = Math.min(roundStart + levelsPerRound - 1, wordLengthMax);
		for (var length = roundStart; length <= roundEnd; length++) {
			var levelDiv = document.createElement("div");
			levelDiv.id = "level-" + length;
			levelDiv.className = "level locked";

			var lengthDiv = document.createElement("div");
			lengthDiv.id = "length-" + length;
			lengthDiv.className = "length";
			lengthDiv.textContent = length;
			levelDiv.appendChild(lengthDiv);

			var wordDiv = document.createElement("div");
			wordDiv.id = "word-" + length;
			wordDiv.className = "word";
			for (var i = 0; i < length; i++) {
				var letterDiv = document.createElement("div");
				letterDiv.className = "letter";
				wordDiv.appendChild(letterDiv);
			}
			levelDiv.appendChild(wordDiv);

			roundDiv.appendChild(levelDiv);
		}
		gameDiv.appendChild(roundDiv);
	}
})();
