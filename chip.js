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

function createWordInputCellInnerHTML(word) {
	var trigramPosition = word.indexOf(trigram);
	const preTrigram = word.slice(0, trigramPosition);
	const postTrigram = word.slice(trigramPosition + 3);
	return preTrigram + "<span>" + trigram + "</span>" + postTrigram;
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
	wordInputCell.innerHTML = createWordInputCellInnerHTML(word);
	rowDiv.appendChild(wordInputCell);

	//Apply styling class to trigram span
	const trigramSpan = wordInputCell.querySelector("span");
	trigramSpan.classList.add("trigramSubstring");

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
