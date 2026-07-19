import { isAnyScreenShown } from "./ui/modal.js";
import { UI_STATE } from "./ui/view.js";
import { submitGuess, addLetter, deleteLetter } from "./game.js";

//
const keyboard = document.getElementById("keyboard");

export function startInteraction() {
	if (!isAnyScreenShown() && UI_STATE.levelsCompleted < 12) {
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
