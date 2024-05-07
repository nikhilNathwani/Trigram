//
const keyboard = document.getElementById("keyboard");

function startInteraction() {
	if (!isAnyScreenShown() && UI_STATE.levelsCompleted < 12) {
		document.addEventListener("keydown", handleKeyPress);
		keyboard.addEventListener("click", handleMouseClick);
	}
}

function stopInteraction() {
	document.removeEventListener("keydown", handleKeyPress);
	keyboard.removeEventListener("click", handleMouseClick);
}

function handleMouseClick(e) {
	if (e.target.matches("[data-enter]")) {
		submitGuess();
		return;
	}
	// *Delete click handled by handleDeleteStart() and handleDeleteEnd()*
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

//
// Make holding down Delete button progressively delete each letter (like with physical keyboard)
//
// const deleteButton = document.getElementById("backspaceKey");

// // Timeout ID for continuous delete
// let deleteTimeout;

// // Event listener for mouse down and touch start on delete button
// deleteButton.addEventListener("mousedown", handleDeleteStart);
// deleteButton.addEventListener("touchstart", handleDeleteStart);

// // Event listener for mouse up and touch end on delete button
// deleteButton.addEventListener("mouseup", handleDeleteEnd);
// deleteButton.addEventListener("touchend", handleDeleteEnd);

// // Event listener for mouse leave and touch cancel on delete button (in case user moves cursor/finger away while holding)
// deleteButton.addEventListener("mouseleave", handleDeleteEnd);
// deleteButton.addEventListener("touchcancel", handleDeleteEnd);

// // Function to handle delete button press (start deletion)
// function handleDeleteStart() {
// 	deleteLetter(); // Delete immediately on press
// 	// Set a timeout for continuous deletion while button is held
// 	deleteTimeout = setTimeout(function () {
// 		deleteTimeout = setInterval(deleteLetter, 100);
// 	}, 500);
// }

// // Function to handle delete button release (end deletion)
// function handleDeleteEnd() {
// 	// Clear the timeout to stop continuous deletion
// 	clearInterval(deleteTimeout);
// }
