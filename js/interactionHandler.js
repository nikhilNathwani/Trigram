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
		deleteLetter();
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
function printGameState() {
	for (let key in GAME_STATE) {
		console.log(key, GAME_STATE[key]);
	}
}
