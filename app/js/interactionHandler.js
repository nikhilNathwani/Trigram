import { isAnyScreenShown } from "./ui/modal.js";
import { submitGuess, addLetter, deleteLetter, gameEvents } from "./game.js";

//
const keyboard = document.getElementById("keyboard");

// Whether the whole game (12 levels) is over. Derived from game.js's
// events, not ui/view.js's levelsCompleted, to avoid a circular import
// (view.js already imports back from here for startInteraction). Checked
// two ways: a live "game:ended", or — since game.js doesn't re-fire that
// on reload, only calling (and skipping) startLevel() — a "game:started"
// whose wordsProvided already has all 12 words.
let gameEnded = false;
gameEvents.addEventListener("game:started", (e) => {
	if (e.detail.wordsProvided.length >= 12) {
		gameEnded = true;
	}
});
gameEvents.addEventListener("game:ended", () => {
	gameEnded = true;
});

export function startInteraction() {
	if (!isAnyScreenShown() && !gameEnded) {
		document.addEventListener("keydown", handleKeyPress);
		keyboard.addEventListener("click", handleMouseClick);
	}
}

export function stopInteraction() {
	document.removeEventListener("keydown", handleKeyPress);
	keyboard.removeEventListener("click", handleMouseClick);
}

function handleMouseClick(e) {
	if (e.target.matches("[data-enter]")) {
		submitGuess();
		return;
	}
	// *Delete click handled by handleDeleteStart() and handleDeleteEnd()*
	// if (e.target.matches("[data-delete]")) {
	// 	deleteLetter();
	// 	return;
	// }
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

//
// Make holding down Delete button progressively delete each letter (like with physical keyboard)
// Behavior: Immediate delete → 500ms grace period → continuous deletion every 100ms
//
const deleteButton = document.getElementById("backspaceKey");
let deleteTimeout;
let deleteInterval;

function handleDeleteStart(delay = 500, interval = 100) {
	deleteLetter(); // Delete one letter immediately on press
	deleteTimeout = setTimeout(() => {
		// Delete another letter after delay,
		// then continue deleting more letters at interval
		deleteLetter();
		deleteInterval = setInterval(deleteLetter, interval);
	}, delay);
}

function handleDeleteStop() {
	clearTimeout(deleteTimeout);
	clearInterval(deleteInterval);
}

// Event listener for mouse down and touch start on delete button
deleteButton.addEventListener("mousedown", function (event) {
	event.preventDefault(); // Prevent default button behavior
	handleDeleteStart();
});
deleteButton.addEventListener("touchstart", function (event) {
	event.preventDefault(); // Prevent default button behavior
	handleDeleteStart();
});

// Event listener for mouse up and touch end on delete button
deleteButton.addEventListener("mouseup", handleDeleteStop);
deleteButton.addEventListener("touchend", handleDeleteStop);

// Event listener for mouse leave and touch cancel on delete button (in case user moves cursor/finger away while holding)
deleteButton.addEventListener("mouseleave", handleDeleteStop);
deleteButton.addEventListener("touchcancel", handleDeleteStop);
