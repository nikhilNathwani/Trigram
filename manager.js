const trigram = "NNN";
var targetLength = 5;

/* -----  MAIN  ------------------------------------------------------------ */

function handleInput() {
	var [isValid, errorReason] = validateWord();
	if (isValid) {
		handleValidWord(); //will have 2nd arg for success reasons like IsLongest or isPersonalBest
	} else {
		handleInvalidWord(errorReason);
	}
}

function handleValidWord() {
	if (isLongestPossibleWord()) {
		return; //Come back to this
	} else {
		incrementTargetLength();
	}
	updateDisplay();
	clearUserInput(); //must be last, because this updates the 'word' global var
}

function handleInvalidWord(errorReason) {
	updateDisplay(errorReason);
}

/* -----  HELPER FUNCTIONS  ------------------------------------------------ */

function incrementTargetLength() {
	//Increment value on backend
	targetLength++;

	//Increment value on frontend (TEMPORARILY REMOVED)
	// const targetLengthUI = document.querySelector("#targetLength");
	// targetLengthUI.innerText = parseInt(targetLengthUI.innerText) + 1;
	//^may want to add error handling. E.g. if targetLengthUI is
	//changed to a non-integer value in dev tools. Or change it
	//from a <p> to an immutable svg
}
