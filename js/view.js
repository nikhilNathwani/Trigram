// UP NEXT:
// -Make view.js create all the html inside the #game div, so index.html only needs to know that the game will go there, and view.js can control the structure entirely
//

// STATE VARIABLES ------------------------------------------------------------- //

initializeHTML();

var nextLetterIndex = 0;
const UI_STATE = {
	currentScore: document.getElementById("score"),
	lettersTyped: document.getElementById("letters"),
	numRequiredLetters: document.getElementById("numRequiredLetters"),
	numTypedLetters: document.getElementById("numTypedLetters"),

	startGame: function (trigram, startLength) {
		document.getElementById("trigram").textContent = trigram;

		UI_STATE.currentScore.textContent = 0;
		UI_STATE.numRequiredLetters.textContent = startLength;
		UI_STATE.numTypedLetters.textContent = 0;

		addLetterDivs(startLength);

		nextLetterIndex = 0;

		console.log("Initial UI_STATE:", UI_STATE);
	},

	startLevel: function (length) {
		addLetterDivs(1);
		UI_STATE.lettersTyped
			.querySelectorAll(".letter")
			.forEach((letterDiv) => (letterDiv.textContent = ""));
		UI_STATE.numRequiredLetters.textContent = length;
		nextLetterIndex = 0;
		UI_STATE.numTypedLetters.textContent = nextLetterIndex;
	},

	addLetter: function (letter) {
		const nextLetterDiv = UI_STATE.lettersTyped.querySelector(
			`.letter:nth-child(${nextLetterIndex + 1})`
		); //offset by 1 because nth-child is 1-indexed, not 0-indexed
		nextLetterDiv.textContent = letter;
		nextLetterIndex += 1;
		UI_STATE.numTypedLetters.textContent = nextLetterIndex;
	},

	deleteLetter: function () {
		const lastTypedLetterDiv = UI_STATE.lettersTyped.querySelector(
			`.letter:nth-child(${nextLetterIndex})`
		); //offset by 1 because nth-child is 1-indexed, not 0-indexed
		lastTypedLetterDiv.textContent = "";
		UI_STATE.numTypedLetters.textContent = nextLetterIndex - 1;
		nextLetterIndex -= 1;
	},

	handleValidGuess: function () {
		return;
	},

	handleInvalidGuess: function (errorString) {
		return;
	},

	endLevel: function (length) {
		UI_STATE.currentScore.textContent = length;
	},

	endGame: function () {
		return;
	},
};

// MAIN  ---------------------------------------------------------- //
function initializeHTML() {
	initializeScoreboardDiv();
	initializeLevelDiv();
}

function initializeScoreboardDiv(trigram, goalScore) {
	var scoreboard = appendNewDivtoParent("scoreboard", "game");

	var trigramWidget = createWidget("trigram", trigram);
	scoreboard.appendChild(trigramWidget);

	var scoreWidget = createWidget("score", 0);
	scoreboard.appendChild(scoreWidget);
}

function createWidget(widgetType, value) {
	//Create the widget wrapper div
	var widgetWrapper = document.createElement("div");
	widgetWrapper.id = widgetType + "Wrapper";

	//Create widget title element
	var titleElement = document.createElement("p");
	titleElement.id = widgetType + "Title";
	titleElement.textContent = widgetType;
	widgetWrapper.appendChild(titleElement);

	//Create widget value element (trigram or current score/goal score)
	var valueElement = document.createElement("p");
	valueElement.id = widgetType;
	valueElement.textContent = value;
	widgetWrapper.appendChild(valueElement);

	return widgetWrapper;
}

function initializeLevelDiv() {
	var level = appendNewDivtoParent("level", "game");

	var widget_numRequiredLetters = createWidget("numRequiredLetters", "");
	level.appendChild(widget_numRequiredLetters);

	var widget_numTypedLetters = createWidget("numTypedLetters", "");
	level.appendChild(widget_numTypedLetters);

	var widget_letters = createWidget("letters", "");
	level.appendChild(widget_letters);
}

function appendNewDivtoParent(newDivID, parentID) {
	const parent = document.getElementById(parentID);
	const newDiv = document.createElement("div");
	newDiv.setAttribute("id", newDivID);
	parent.appendChild(newDiv);
	return document.getElementById(newDivID);
}

// HELPER  -------------------------------------------------------- //
function getTrigram() {
	return "CAR";
}

function getMaxWordLength(trigram) {
	return 15;
}

function addLetterDivs(numLetters) {
	for (let index = 0; index < numLetters; index++) {
		var letter = document.createElement("div");
		letter.classList.add("letter");
		UI_STATE.lettersTyped.appendChild(letter);
	}
}

// BELONGS IN OTHER FILES -------------------------------------------------- //
