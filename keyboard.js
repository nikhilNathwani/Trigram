const keys = document.querySelectorAll(".keyboard-key");
const input = document.querySelector("input");

//Event listeners for clicking on the on-screen keyboard
keys.forEach((key) => {
	key.addEventListener("click", () => {
		handleKeyPress(key.dataset.keyname);
	});
});

//Event listener for typing on physical keyboard
document.addEventListener("keydown", (e) => {
	handleKeyPress(e.key);
});

function handleKeyPress(key) {
	if (key === "Enter") {
		var word = getInputWord();
		var [isValid, errorReason] = isWordValid(word);
		if (isValid) {
			handleValidWord(word);
		} else {
			displayError(errorReason);
		}
		// submitWord();
	} else if (key === "Backspace") {
		deleteLetter();
	} else {
		[isLetter, letter] = isLetterFromOnscreenKeyboard(key);
		if (isLetter) {
			addLetter(letter);
		}
	}
}

function getInputWord() {
	return wordInput.value.trim(); //trim() ignores whitespace at start/end
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
	wordInput.value = "";
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

function displayError() {
	return;
}

function introduceNextRound() {
	return;
}

function isWordValid(word) {
	const [meetsConstraints, errors] = checkWord(word);
	if (!meetsConstraints) {
		errors.forEach((errorCode) => addErrorToErrorDisplayArea(errorCode));
	}
	return [meetsConstraints, ""];
}

function isLongestPossibleWord(word) {
	return false;
}
