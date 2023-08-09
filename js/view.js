// UP NEXT:
// -Make view.js create all the html inside the #game div, so index.html only needs to know that the game will go there, and view.js can control the structure entirely
//

// STATE VARIABLES ------------------------------------------------------------- //

initializeHTML();

var nextLetterIndex = 0;
const UI_STATE = {
	currentScore: document.getElementById("currentScore"),
	lettersTyped: document.getElementById("letters"),
	numLettersTyped: document.getElementById("numLettersTyped", "score"),
	numLettersRequired: document.getElementById("numLettersRequired", "score"),
};

function startGame(trigram, startLength) {
	//Set the immutable vars
	document.getElementById("trigram").textContent = trigram;

	UI_STATE.currentScore.textContent = 0;
	UI_STATE.numLettersRequired.textContent = startLength;
	UI_STATE.numLettersTyped.textContent = 0;
	addLetterDivs(startLength);
	UI_STATE.lettersTyped = document.querySelector("#letters");
	nextLetterIndex = 0;
	console.log("Initial UI_STATE:", UI_STATE);
}

function startLevel(length) {
	addLetterDivs(1);
	UI_STATE.lettersTyped
		.querySelectorAll(".letter")
		.forEach((letterDiv) => (letterDiv.textContent = ""));
	UI_STATE.numLettersRequired.textContent = length;
	nextLetterIndex = 0;
	UI_STATE.numLettersTyped.textContent = nextLetterIndex;
}

function addLetter(letter) {
	const nextLetterDiv = UI_STATE.lettersTyped.querySelector(
		`.letter:nth-child(${nextLetterIndex + 1})`
	); //offset by 1 because nth-child is 1-indexed, not 0-indexed
	nextLetterDiv.textContent = letter;
	nextLetterIndex += 1;
	UI_STATE.numLettersTyped.textContent = nextLetterIndex;
}

function deleteLetter() {
	const lastTypedLetterDiv = UI_STATE.lettersTyped.querySelector(
		`.letter:nth-child(${nextLetterIndex})`
	); //offset by 1 because nth-child is 1-indexed, not 0-indexed
	lastTypedLetterDiv.textContent = "";
	UI_STATE.numLettersTyped.textContent = nextLetterIndex - 1;
	nextLetterIndex -= 1;
}

function handleValidGuess() {
	return;
}

function handleInvalidGuess(errorString) {
	return;
}

function endLevel(length) {
	UI_STATE.currentScore.textContent = length;
}

function endGame() {
	return;
}

// MAIN FUNCTIONS ---------------------------------------------------------- //

/* 
<div id="scoreboard">
	<div id="trigramWrapper">
		<p>Trigram:</p>
		<p id="trigram"></p>
	</div>
	<div id="scoreWrapper">
	<p id="currentScore"></p>
	<p
	<h3>Current Score:</h3>
	<div id="currentScore"></div>
</div>
<div id="level">
	<h1>Level</h1>
	<h3>Target Length:</h3>
	<div id="numLettersRequired"></div>
	<h3>Letters Typed:</h3>
	<div id="numLettersTyped"></div>
	<h3>Input word:</h3>
	<div id="letters"></div>
</div> 
*/

function initializeHTML() {
	initializeScoreboardDiv();
	initializeLevelDiv();
}

function initializeScoreboardDiv(trigram, goalScore) {
	var scoreboard = appendNewDivtoParent("scoreboard", "game");

	var trigramWidget = createScoreWidget("trigram", trigram);
	scoreboard.appendChild(trigramWidget);

	var scoreWidget = createScoreWidget("score", 0);
	scoreboard.appendChild(valueElement);
}

function createScoreWidget(widgetType, value) {
	//Create the widget wrapper div
	var widgetWrapper = document.createElement("div");
	widgetWrapper.id = widgetType + "Wrapper";

	//Create widget title element
	var titleElement = document.createElement("p");
	titleElement.id = widgetType + "Title";
	titleElement.textContent = widgetType;

	//Create widget value element (trigram or current score/goal score)
	var valueElement = document.createElement("p");
	valueElement.id = widgetType;
	valueElement.textContent = value;
}

function initializeLevelDiv() {
	appendNewDivtoParent("level", "game");
}

function appendNewDivtoParent(newDivID, parentID) {
	const parent = document.getElementById(parentID);
	const newDiv = document.createElement("div");
	newDiv.setAttribute("id", newDivID);
	parent.appendChild(newDiv);
	return document.getElementById(newDivID);
}

// HELPER FUNCTIONS -------------------------------------------------------- //
function getTrigram() {
	return "CAR";
}

function getMaxWordLength(trigram) {
	return 15;
}

function addLetterDivs(numLetters) {
	var letterContainer = document.getElementById("letters");
	for (let index = 0; index < numLetters; index++) {
		var letter = document.createElement("div");
		letter.classList.add("letter");
		letterContainer.appendChild(letter);
	}
}

// BELONGS IN OTHER FILES -------------------------------------------------- //
