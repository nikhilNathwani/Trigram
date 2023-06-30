var inputs = document.querySelectorAll("input.inputField");

/* -----  MAIN  ------------------------------------------------------------ */

// Attach event listeners to each input field
inputs.forEach(function (input, index) {
	input.addEventListener("focus", function (event) {
		handleFocus(event, index + game.minTargetLength);
	});
	input.addEventListener("blur", function (event) {
		handleUnfocus(event, index + game.minTargetLength);
	});
	input.addEventListener("keydown", function (event) {
		handleKeyDown(event, index + game.minTargetLength);
	});
	input.addEventListener("input", function (event) {
		handleInput(event, index + game.minTargetLength);
	});
});

// Event handler for focus event
function handleFocus(event, levelNumber) {
	console.log("FOCUS event for LEVEL", levelNumber);
}

// Event handler for un-focus ("blur") event
function handleUnfocus(event, levelNumber) {
	console.log("UNFOCUS event for LEVEL", levelNumber);
}

// Event handler for focus event
function handleInput(event, levelNumber) {
	var word = event.target.value;
	if (isTargetLengthReached(word)) {
		processInput(word);
	}
}

// Event handler for keydown event (intercept Enter action & invalid chars)
function handleKeyDown(event, levelNumber) {
	var inputChar = event.key;
	var word = event.target.value;
	if (!isAcceptedChar(inputChar)) {
		event.preventDefault();
		return;
	}
	if (
		(inputChar === "Enter" && word.length > 0) ||
		(word.length == game.currentLevel.wordLength &&
			inputChar !== "Backspace")
	) {
		event.preventDefault();
		processInput(word);
		return;
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
