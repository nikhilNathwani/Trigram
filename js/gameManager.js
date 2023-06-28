import Level from "./class/level.js";
import Game from "./class/game.js";

const trigram = "CAT";
const initialTargetLength = 6;
const maxTargetLength = 10;

var currentTargetLength = initialTargetLength;
var nextTargetLength = initialTargetLength + 1;
var completedTargetLengths = {};

//Only these functions:
// 1) startGame
// 2) playLevel
// 3) processInput
// 4) endLevel
// 5) endGame

/* -----  MAIN  ------------------------------------------------------------ */

startGame();

function startGame() {
	createAllLevels(initialTargetLength, maxTargetLength);
	playLevel(initialTargetLength);
}

function updatePreviousLevelState() {
	if (!(currentTargetLength in completedTargetLengths)) {
		setStateInactive(currentTargetLength);
	}
}

function playLevel(wordLength) {
	updatePreviousLevelState();
	setActiveLevel(wordLength);
	setNextLevel(wordLength);

	displayLevel(wordLength);
	listenForInput(wordLength);
}

function endLevel(wordLength) {
	return;
}

function processInput(word) {
	var [isValid, errorReason] = validateWord(word); //owned by legal
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
