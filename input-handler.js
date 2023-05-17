const keys = document.querySelectorAll(".keyboard-key");
const input = document.querySelector("input");

/* -----  MAIN THREAD  ----------------------------------------------------- */

//Create event listeners for clicking on the on-screen keyboard
keys.forEach((key) => {
	key.addEventListener("click", () => {
		handleKeyPress(key.dataset.keyname);
	});
});

//Create event listener for typing on physical keyboard
document.addEventListener("keydown", (e) => {
	handleKeyPress(e.key);
});

function handleKeyPress(key) {
	if (key === "Backspace") {
		deleteLetter();
	} else if (key === "Enter") {
		if (getInputWord().length > 0) {
			handleInputWord();
		}
	} else if (isTargetLengthReached()) {
		//~
		handleInputWord();
	} else {
		[isLetter, letter] = isLetterFromOnscreenKeyboard(key);
		if (isLetter) {
			addLetter(letter);
			if (isTargetLengthReached()) {
				handleInputWord();
			}
		}
	}
}
//~ this is the case where the user had just gotten an error for a word that
//  was of target length, then typed another char before deleting one. Need to
//  eat that char and continue to display the previous error (user will need
//  to recognize that they need to delete chars and try again).

/* -----  HELPER FUNCTIONS  ------------------------------------------------ */

function getInputWord() {
	return input.value.trim(); //trim() ignores whitespace at start/end
}

function isTargetLengthReached() {
	return targetLength == input.value.trim().length;
}

function isWordValid() {
	var word = getInputWord();
	const [meetsConstraints, errors] = checkWord(word);
	if (!meetsConstraints) {
		errors.forEach((errorCode) => addErrorToErrorDisplayArea(errorCode));
	}
	return [word, meetsConstraints, ""];
}

function handleInputWord() {
	var [word, isValid, errorReason] = isWordValid();
	if (isValid) {
		handleValidWord(word);
	} else {
		displayError(errorReason);
	}
}

function handleValidWord(word) {
	clearExistingErrors();
	addWordToDisplayArea(word, word.indexOf(trigram));
	clearInput();
	if (isLongestPossibleWord(word)) {
		return; //Come back to this
	} else {
		incrementTargetLength();
		introduceNextRound();
	}
}

function deleteLetter() {
	if (input.value.length > 0) {
		input.value = input.value.slice(0, -1);
	}
}

function clearInput() {
	input.value = "";
}

function addLetter(letter) {
	input.value += letter;
}

function isLetterFromOnscreenKeyboard(key) {
	const letter = key.toUpperCase();
	const matchingKey = document.querySelector(
		`.keyboard-key[data-keyname="${letter}"]`
	);
	return [matchingKey !== null, letter];
}

function isLongestPossibleWord(word) {
	return false;
}
