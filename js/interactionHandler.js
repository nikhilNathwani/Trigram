//
const keyboard = document.getElementById("keyboard");

function startInteraction() {
	document.addEventListener("keydown", handleKeyPress);
	keyboard.addEventListener("click", handleMouseClick);
	console.log("interaction started", arguments.callee.caller);
}

function stopInteraction() {
	document.removeEventListener("keydown", handleKeyPress);
	keyboard.removeEventListener("click", handleMouseClick);
	console.log("interaction stopped", arguments.callee.caller);
}

function handleMouseClick(e) {
	console.log("handling mouse click");
	if (e.target.matches("[data-enter]")) {
		submitGuess();
		return;
	}

	if (e.target.matches("[data-delete]")) {
		deleteLetter();
		return;
	}
	if (e.target.matches("[data-keyname]")) {
		addLetter(e.target.dataset.keyname);
		return;
	}
}

function handleKeyPress(e) {
	console.log("handling key press");

	if (e.key === "Enter") {
		submitGuess();
		return;
	}
	if (e.key === "Backspace" || e.key === "Delete") {
		deleteLetter();
		return;
	}
	if (e.key.match(/^[a-z]$/) && !(e.ctrlKey || e.altKey || e.metaKey)) {
		addLetter(e.key);
		return;
	}
}
