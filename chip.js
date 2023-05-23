const gameArea = document.querySelector("#gameArea");
const displayArea = document.querySelector("#displayArea");
const gameDisplayGrid = document.querySelector("#gameDisplayGrid");
const errorDialog = document.querySelector("#errorString");
const rootStyles = getComputedStyle(document.documentElement);
const letterGap = rootStyles.getPropertyValue("--letterGap");
//

function changeCurrentInputFieldToStaticDisplay(word) {
	const currentInputField = document.querySelector(
		`input#wordInputBox_${targetLength - 1}`
	);
	currentInputField.remove();

	//Create cell containing completed word
	const wordInputCell = document.querySelector(
		`div#wordInputCell_${targetLength - 1}`
	);
	wordInputCell.innerHTML = createWordInputCellInnerHTML(
		acceptedWords[targetLength - 1]
	);

	//Apply styling class to trigram span
	const trigramSpan = wordInputCell.querySelector("span");
	trigramSpan.classList.add("trigramSubstring");
}

function addInputDivToDisplay() {
	//Create row div
	const rowDiv = document.createElement("div");
	rowDiv.classList.add("gameDisplayRow");

	//Create cell containing target length
	const targetLengthCell = document.createElement("div");
	targetLengthCell.classList.add("targetLengthCell");
	targetLengthCell.id = "targetLengthCell_" + targetLength;
	targetLengthCell.textContent = targetLength;
	rowDiv.appendChild(targetLengthCell);

	//Create cell containing input field
	const wordInputCell = document.createElement("div");
	wordInputCell.classList.add("wordInputCell");
	wordInputCell.id = "wordInputCell_" + targetLength;
	rowDiv.appendChild(wordInputCell);

	//Create input field
	const wordInputBox = document.createElement("input");
	// Set the attributes
	wordInputBox.style.width = `calc((${targetLength} * (1ch + ${letterGap})))`;
	wordInputBox.type = "text";
	wordInputBox.name = "wordInput";
	wordInputBox.id = "wordInput";
	wordInputBox.maxLength = targetLength;
	wordInputBox.classList.add("wordInputBox");
	wordInputBox.id = "wordInputBox_" + targetLength;
	wordInputCell.appendChild(wordInputBox);

	gameDisplayGrid.appendChild(rowDiv);
	scrollDisplayToBottom();
}

function playAcceptedWordAnimation() {
	return;
}

function moveAcceptedWordToCompletedList() {
	return;
}

function updateDisplay(word, errorReason = "") {
	if (errorReason == "") {
		clearExistingErrors();
		playAcceptedWordAnimation();
		// addWordToDisplayArea(word);
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