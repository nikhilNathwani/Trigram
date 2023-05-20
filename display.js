const displayArea = document.querySelector("#displayArea");
const gameArea = document.querySelector("#gameArea");
const errorDialog = document.querySelector("#errorString");

function updateDisplay(word, errorReason = "") {
	if (errorReason == "") {
		clearExistingErrors();
		addWordToDisplayArea(word);
		introduceNextRound();
	} else {
		displayError(word, errorReason);
	}
}

function addWordToDisplayArea(word) {
	//Create row div
	const rowDiv = document.createElement("div");
	rowDiv.classList.add("word");

	var trigramPosition = word.indexOf(trigram);

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

function displayError(word, errorReason) {
	errorDialog.textContent = errorReason;
}

function clearExistingErrors() {
	errorDialog.textContent = "";
}

function introduceNextRound() {
	return;
}

function scrollDisplayToBottom() {
	gameArea.scrollTop = gameArea.scrollHeight;
}
