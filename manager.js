const trigram = "NNN";
var targetLength = 5;

const form = document.querySelector("form");
const displayArea = document.querySelector("#displayArea");

function deleteLetter() {
	if (input.value.length > 0) {
		input.value = input.value.slice(0, -1);
	}
}

function addLetter(letter) {
	input.value += letter;
}

function handleInputWord() {
	var word = getInputWord();
	if (word.length == 0) {
		return;
	}
	var [isValid, errorReason] = validateWord();
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

function addWordToDisplayArea(word, trigramPosition) {
	//Create row div
	const rowDiv = document.createElement("div");
	rowDiv.classList.add("word");
	//Create letter divs for each letter in the word
	for (let i = 0; i < word.length; i++) {
		const letterDiv = document.createElement("div");
		letterDiv.textContent = word[i];
		letterDiv.classList.add("letter");
		//If it's a trigram letter, apply trigram styling
		if (i >= trigramPosition && i <= trigramPosition + 2) {
			letterDiv.classList.add("trigramLetter");
		}
		rowDiv.appendChild(letterDiv);
	}
	displayArea.appendChild(rowDiv);
	scrollDisplayToBottom();
}

function incrementTargetLength() {
	//Increment value on backend
	targetLength++;

	//Increment value on frontend (TEMPORARILY REMOVED)
	// const targetLengthUI = document.querySelector("#targetLength");
	// targetLengthUI.innerText = parseInt(targetLengthUI.innerText) + 1;
	//^may want to add error handling. E.g. if targetLengthUI is
	//changed to a non-integer value in dev tools. Or change it
	//from a <p> to an immutable svg
}
