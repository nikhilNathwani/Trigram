const gameContainer = document.querySelector("#gameContainer");
const gameDisplayArea = document.querySelector("#gameDisplayArea");
const rootStyles = getComputedStyle(document.documentElement);
const letterGap = rootStyles.getPropertyValue("--letterGap");
//

positionAlertContainer();

function positionAlertContainer() {
	const keyboardContainer = document.querySelector("#keyboardContainer");
	const alertContainer = document.querySelector("#alertContainer");

	// Calculate the desired position
	var keyboardContainerRect = keyboardContainer.getBoundingClientRect();
	var desiredTop = keyboardContainerRect.top - alertContainer.offsetHeight;

	// Set the position of the errorPopup
	alertContainer.style.top = desiredTop + 3 + "px";
}

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
	targetLengthCell.textContent = targetLength + " letter word";
	rowDiv.appendChild(targetLengthCell);

	//Create cell containing input field
	const wordInputCell = document.createElement("div");
	wordInputCell.classList.add("wordInputCell");
	wordInputCell.classList.add("active");
	wordInputCell.id = "wordInputCell_" + targetLength;
	rowDiv.appendChild(wordInputCell);

	//Create input field
	const wordInputBox = document.createElement("input");
	// Set the attributes
	wordInputBox.style.width = `calc((${targetLength} * (1ch + ${letterGap})))`;
	wordInputBox.type = "text";
	wordInputBox.name = "wordInput";
	wordInputBox.maxLength = targetLength;
	wordInputBox.classList.add("wordInputBox");
	wordInputBox.id = "wordInputBox_" + targetLength;
	wordInputCell.appendChild(wordInputBox);

	gameDisplayArea.appendChild(rowDiv);
	scrollDisplayToBottom();
}

function playAcceptedWordAnimation() {
	updateTargetLengthFlag();
	return;
}

function updateTargetLengthFlag() {
	const targetLengthFlag = document.querySelector(
		"#targetLengthCell_" + targetLength
	);
	targetLengthFlag.innerHTML = `<i class="fas fa-check" id="checkMark"></i>${targetLength}`;
	targetLengthFlag.style.width = "min-content";
	targetLengthFlag.style.backgroundColor =
		rootStyles.getPropertyValue("--accent-color");
	targetLengthFlag.style.borderLeft = "2px solid white";
	targetLengthFlag.style.borderRight = "2px solid white";
	targetLengthFlag.style.borderTop = "2px solid white";
	const wordInputCell = document.querySelector(
		"#wordInputCell_" + targetLength
	);
	wordInputCell.style.height = "3rem";
	wordInputCell.style.width = "min-content";
	wordInputCell.classList.remove("active");
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

function displayError(word, errorReason) {
	clearExistingErrors();
	const alertContainer = document.querySelector("#alertContainer");
	const alertPopup = document.createElement("div");
	alertPopup.id = "alertPopup";
	alertPopup.textContent = errorReason;
	alertContainer.appendChild(alertPopup);
}

function clearExistingErrors() {
	const alertContainer = document.querySelector("div#alertContainer");
	alertContainer.innerHTML = "";
}

function introduceNextRound() {
	return;
}

function scrollDisplayToBottom() {
	gameContainer.scrollTop = gameContainer.scrollHeight;
}
