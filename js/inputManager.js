var inputs = document.querySelectorAll("input.inputField");
var inputStateEnum = {
	INACTIVE: "inactive",
	ACTIVE: "active",
	COMPLETED: "completed",
};

/* -----  MAIN  ------------------------------------------------------------ */

// Set the initial focus on the first input field
// inputs[0].focus();

// Attach event listeners to each input field
inputs.forEach(function (input, index) {
	input.addEventListener("focus", function (event) {
		handleFocus(event, index + initialTargetLength);
	});
	input.addEventListener("blur", function (event) {
		handleUnfocus(event, index + initialTargetLength);
	});
	input.addEventListener("keydown", function (event) {
		handleKeyDown(event, index + initialTargetLength);
	});
});

// Event handler for focus event
function handleFocus(event, levelNumber) {
	console.log("FOCUS event for LEVEL", levelNumber);
	startLevel(levelNumber);
}

// Event handler for un-focus ("blur") event
function handleUnfocus(event, levelNumber) {
	console.log("UNFOCUS event for LEVEL", levelNumber);
}

// Event handler for keydown event
function handleKeyDown(event, levelNumber) {
	var word = event.target.value;
	var inputChar = event.key;
	// Case 0 of 3:
	// - If not an accepted char, then ignore
	if (!isAcceptedChar(inputChar)) {
		event.preventDefault();
	}
	// Case 1 of 3:
	// - User hit 'Enter'
	else if (inputChar === "Enter") {
		console.log("Enter key pressed");
		if (word.length > 0) {
			processInput(word);
		}
	}
	// Case 2 of 3:
	// - User is already at targetLength (*)
	else if (word.length > currentTargetLength) {
		e.target.value = word.slice(0, currentTargetLength);
		processInput(word);
		// (*) E.g. can happen if user hit a "Not in word list",
		//     error then kept typing chars before deleting any)
	}
	// Case 3 of 3:
	// - User inputted a letter and hit the target length
	else {
		if (isLetter(inputChar) && isTargetLengthReached(word)) {
			processInput(word);
		}
	}
}

function createAllLevels(firstLevel, lastLevel) {
	drawAllLevels(firstLevel, lastLevel);
}

function setActiveLevel(levelNumber) {
	return;
}

function setInactiveLevel(levelNumber) {
	return;
}

function setCompletedLevel(levelNumber) {
	return;
}

/* -----  HELPER FUNCTIONS  ------------------------------------------------ */

function isAcceptedChar(key) {
	var result = key === "Backspace" || key === "Enter" || isLetter(key);
	return result;
}

function listenForInput(levelNumber) {
	input = document.querySelector(`input#inputField_${levelNumber}`);
	input.focus();
}

function getUserInput() {
	return input.value.trim(); //trim() ignores whitespace at start/end
}

function displayLetter() {
	input.value = input.value.toUpperCase();
}

function deleteChar() {
	if (input.value.length > 0) {
		input.value = input.value.slice(0, -1);
	}
}

function clearUserInput() {
	input.value = "";
}

function isLetter(key) {
	const letter = key.toUpperCase();
	const matchingKey = document.querySelector(
		`.keyboard-key[data-keyname="${letter}"]`
	);
	return matchingKey !== null;
}
