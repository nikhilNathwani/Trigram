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

		var wordInputCell = document.createElement("div");
		wordInputCell.className = "wordInputCell";
		wordInputCell.id = "wordInputCell_" + N;
		gameDisplayRow.appendChild(wordInputCell);

		if (N == targetLength) {
			gameDisplayRow.classList.add("active");
		} else {
			gameDisplayRow.classList.add("locked");
			wordInputCell.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 1rem; height: 1rem;">
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
</svg>
`;
		}

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
