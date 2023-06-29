//Only these functions:
// 1) startGame
// 2) playLevel
// 3) processInput
// 4) endLevel
// 5) endGame

/* -----  MAIN  ------------------------------------------------------------ */

const game = new Game("CAT", 6, 10);
const levels = game.allLevels;

function processInput(word) {
	var [isValid, errorReason] = validateWord(word); //owned by legal
	if (isValid) {
		handleValidWord(word); //will have 2nd arg for success reasons like IsLongest or isPersonalBest
	} else {
		handleInvalidWord(word, errorReason);
	}
}

function handleValidWord(word) {
	game.acceptWord(word);
}

function handleInvalidWord(word, errorReason) {
	updateDisplay(word, errorReason);
}

/* -----  HELPER FUNCTIONS  ------------------------------------------------ */
