//
function startInteraction() {
	document.addEventListener("keydown", handleKeyPress);
	document.addEventListener("click", handleMouseClick);
}

function stopInteraction() {
	document.removeEventListener("keydown", handleKeyPress);
	document.removeEventListener("click", handleMouseClick);
}

function handleMouseClick(e) {
	if (e.target.matches("[data-keyname]")) {
		addLetter(e.target.dataset.keyname);
		return;
	}

	if (e.target.matches("[data-enter]")) {
		submitGuess();
		return;
	}

	if (e.target.matches("[data-delete]")) {
		deleteLetter();
		return;
	}
}

function handleKeyPress(e) {
	console.log("Keypress registered");
	console.log("Key:", e);
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
