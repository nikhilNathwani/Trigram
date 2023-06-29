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
	//Add word to accepted word list
	game.completedLevels[word.length] = word;
	//Set level state to complete
	levels[word.length].setState(LevelState.COMPLETE);
	//Update current and next level fields
	if (game.isGameComplete()) {
		console.log("You win!");
	} else {
		game.currentLevel = game.nextLevel;
		game.nextLevel = null;
	}
	// updateDisplay(word);
	if (isLongestPossibleWord(word)) {
		return; //Come back to this
	} else {
		incrementTargetLength();
	}
	initiateNextRound();
	clearUserInput(); //must be last, because this updates the 'word' global var
}

function handleInvalidWord(word, errorReason) {
	updateDisplay(word, errorReason);
}

/* -----  HELPER FUNCTIONS  ------------------------------------------------ */
