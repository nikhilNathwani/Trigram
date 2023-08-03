startInteraction();

function startInteraction() {
	document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
	document.removeEventListener("keydown", handleKeyPress);
}

function printGameState() {
	for (let key in GAME_STATE) {
		console.log(key, GAME_STATE[key]);
	}
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
		pressKey(e.key);
		printGameState();
		return;
	}
}

function pressKey(key) {
	var currentlyTyped =
		GAME_STATE.lettersProvided[GAME_STATE.wordLength_current];
	if (currentlyTyped.length == GAME_STATE.wordLength_current) {
		submitGuess();
	} else {
		addLetter(key);
	}
}

function deleteKey() {
	var currentlyTyped =
		GAME_STATE.lettersProvided[GAME_STATE.wordLength_current];
	if (currentlyTyped.length > 0) {
		deleteLetter();
	}
}
