// Generates the 12 near-identical .level blocks (word lengths 4-15,
// grouped into rounds of 3 — mirroring the round-number grouping
// view.js's handleLevelStarted assumes) instead of hand-typing them.
//
// Must stay a classic <script src="..."> (not type="module"): modules
// defer until after the document is parsed, same as the module scripts at
// the end of <body>, but view.js queries .round/.level elements at its
// own top level — they need to already exist by then, not just by
// DOMContentLoaded.
//
// Letters render empty — CSS already hides unfilled/locked letters, and
// width is a fixed calc(), not content-dependent.
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
