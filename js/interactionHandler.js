// MAIN FUNCTIONS ---------------------------------------------------------- //
function startInteraction() {
	document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
	document.removeEventListener("keydown", handleKeyPress);
}

function handleKeyPress(e) {
	if (e.key === "Enter") {
		submitGuess();
		printGameState();
		return;
	}
	if (e.key === "Backspace" || e.key === "Delete") {
		deleteKey();
		printGameState();
		return;
	}
	if (e.key.match(/^[a-z]$/)) {
		addLetter(e.key);
		printGameState();
		return;
	}
}

// HELPER FUNCTIONS -------------------------------------------------------- //
function deleteKey() {
	var currentlyTyped =
		GAME_STATE.lettersProvided[GAME_STATE.wordLength_current];
	if (currentlyTyped.length > 0) {
		deleteLetter();
	}
}

function printGameState() {
	for (let key in GAME_STATE) {
		console.log(key, GAME_STATE[key]);
	}
}
