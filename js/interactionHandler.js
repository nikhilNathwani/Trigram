//
const keyboard = document.getElementById("keyboard");

function startInteraction() {
	console.log(
		"trying to start interaction",
		arguments.callee.caller,
		isAnyScreenShown(),
		UI_STATE.levelsCompleted < 12
	);

	if (!isAnyScreenShown() && UI_STATE.levelsCompleted < 12) {
		console.log("starting interaction", arguments.callee.caller);
		document.addEventListener("keydown", handleKeyPress);
		keyboard.addEventListener("click", handleMouseClick);
	}
}

function stopInteraction() {
	console.log("stopping interaction", arguments.callee.caller);
	document.removeEventListener("keydown", handleKeyPress);
	keyboard.removeEventListener("click", handleMouseClick);
}

function handleMouseClick(e) {
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
