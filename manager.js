const trigram = "CAT";
var targetLength = 5;
var maxLength = 10;
var acceptedWords = ["", "", "", "", ""];

/* -----  MAIN  ------------------------------------------------------------ */

initiateBoard();

initiateNextRound();

function initiateBoard() {
	var parentElement = document.getElementById("gameDisplayArea");

	for (var N = targetLength; N <= maxLength; N++) {
		var gameDisplayRow = document.createElement("div");
		gameDisplayRow.className = "gameDisplayRow";
		gameDisplayRow.id = "gameDisplayRow_" + N;
		if (N == targetLength) {
			gameDisplayRow.classList.add("active");
		} else {
			gameDisplayRow.classList.add("locked");
		}

		var wordInputCell = document.createElement("div");
		wordInputCell.className = "wordInputCell";
		wordInputCell.id = "wordInputCell_" + N;
		gameDisplayRow.appendChild(wordInputCell);

		parentElement.appendChild(gameDisplayRow);
	}
}

function initiateNextRound() {
	if (targetLength > 5) {
		changeCurrentInputFieldToStaticDisplay();
	}
	addInputDivToDisplay(targetLength);
	listenToNewInputField();
}
function listenToNewInputField() {
	input = document.querySelector(`input#wordInputBox_${targetLength}`);
}

function handleInput(word) {
	var [isValid, errorReason] = validateWord(word);
	if (isValid) {
		handleValidWord(word); //will have 2nd arg for success reasons like IsLongest or isPersonalBest
	} else {
		handleInvalidWord(word, errorReason);
	}
}

function addWordToAcceptedWordsList(word) {
	acceptedWords.push(word);
}

function handleValidWord(word) {
	// playAcceptedWordAnimation()
	// moveAcceptedWordToCompletedList()
	addWordToAcceptedWordsList(word);
	updateDisplay(word);
	if (isLongestPossibleWord(word)) {
		return; //Come back to this
	} else {
		incrementTargetLength();
	}
	initiateNextRound();
	clearUserInput(); //must be last, because this updates the 'word' global var
}

function handleInvalidWord(word, errorReason) {
	updateDisplay(word, errorReason);
}

/* -----  HELPER FUNCTIONS  ------------------------------------------------ */

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
