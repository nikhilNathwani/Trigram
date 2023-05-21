const gameArea = document.querySelector("#gameArea");
const displayArea = document.querySelector("#displayArea");
const gameDisplayGrid = document.querySelector("#gameDisplayGrid");
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
	rowDiv.classList.add("gameDisplayRow");

	//Create cell containing target length
	const targetLengthCell = document.createElement("div");
	targetLengthCell.classList.add("targetLengthCell");
	targetLengthCell.id = "targetLengthCell_" + targetLength;
	targetLengthCell.textContent = targetLength;
	rowDiv.appendChild(targetLengthCell);

	//Create cell containing completed word
	const wordInputCell = document.createElement("div");
	wordInputCell.classList.add("wordInputCell");
	wordInputCell.id = "wordInputCell_" + targetLength;
	wordInputCell.textContent = word;
	rowDiv.appendChild(wordInputCell);

	// var trigramPosition = word.indexOf(trigram);

	//Create letter divs for each letter in the word
	// for (let i = 0; i < word.length; i++) {
	// 	const letterDiv = document.createElement("div");
	// 	letterDiv.textContent = word[i];
	// 	letterDiv.classList.add("letter");
	// 	//If it's a trigram letter, apply trigram styling
	// 	if (i >= trigramPosition && i <= trigramPosition + 2) {
	// 		letterDiv.classList.add("trigramLetter");
	// 	}
	// 	rowDiv.appendChild(letterDiv);
	// }

	gameDisplayGrid.appendChild(rowDiv);
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
