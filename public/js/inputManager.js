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

/* -----  EVENT HANDLER SETUP  --------------------------------------------- */
function handleFocus(event, levelNumber) {
	console.log("FOCUS event for LEVEL", levelNumber);
	var level = game.allLevels[levelNumber];
	level.setState(LevelState.ACTIVE);
}
function handleUnfocus(event, levelNumber) {
	console.log("UNFOCUS event for LEVEL", levelNumber);
	var level = game.allLevels[levelNumber];
	if (level.getAcceptedWord() == "") {
		level.setState(LevelState.INACTIVE);
	}
}
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
function handleInput(event, levelNumber) {
	var word = event.target.value;
	if (isTargetLengthReached(word)) {
		processInput(word);
	}
}

/* -----  HELPER FUNCTIONS  ------------------------------------------------ */

function isAcceptedChar(key) {
	var result = key === "Backspace" || key === "Enter" || isLetter(key);
	return result;
}

function isLetter(key) {
	const letter = key.toUpperCase();
	const matchingKey = document.querySelector(
		`.keyboard-key[data-keyname="${letter}"]`
	);
	return matchingKey !== null;
}

/* -----  OLD FUNCTIONS  ------------------------------------------------ */
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
