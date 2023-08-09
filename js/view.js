// UP NEXT:
// -Add alerts widget at the bottom of the #level div, which displays error messages and the final YOU WIN message
//

var nextLetterIndex = 0;
const divID = {
	TRIGRAM: "trigram",
	SCORE: "score",
	LETTERS: "letters",
	NUM_LETTERS_REQUIRED: "numRequiredLetters",
	NUM_LETTERS_TYPED: "numTypedLetters",
	ALERT: "message",
};

// MAIN THREAD ------------------------------------------------------------- //

initializeHTML();

const UI_STATE = {
	score: document.getElementById(divID.SCORE),
	lettersTyped: document.getElementById(divID.LETTERS),
	numRequiredLetters: document.getElementById(divID.NUM_LETTERS_REQUIRED),
	numTypedLetters: document.getElementById(divID.NUM_LETTERS_TYPED),
	alert: document.getElementById(divID.ALERT),

	startGame: function (trigram, startLength) {
		document.getElementById(divID.TRIGRAM).textContent = trigram;

		this.score.textContent = 0;
		this.numRequiredLetters.textContent = startLength;
		this.numTypedLetters.textContent = 0;
		this.lettersTyped.textContent = "";

		nextLetterIndex = 0;

		console.log("Initial UI STATE:", this);
	},

	startLevel: function (length) {
		this.lettersTyped.textContent = "";
		this.numRequiredLetters.textContent = length;
		nextLetterIndex = 0;
		this.numTypedLetters.textContent = nextLetterIndex;
	},

	addLetter: function (letter) {
		this.alert.textContent = "";

		this.lettersTyped.textContent += letter;
		nextLetterIndex += 1;
		this.numTypedLetters.textContent = nextLetterIndex;
	},

	deleteLetter: function () {
		this.lettersTyped.textContent = this.lettersTyped.textContent.slice(
			0,
			-1
		);
		this.numTypedLetters.textContent = nextLetterIndex - 1;
		nextLetterIndex -= 1;
	},

	handleValidGuess: function (length) {
		this.score.textContent = length;
	},

	handleInvalidGuess: function (errorString) {
		this.alert.textContent = errorString;
	},

	endLevel: function (length) {
		this.score.textContent = length;
	},

	endGame: function () {
		this.alert.textContent = "YOU WIN!";
	},
};

// MAIN FUNCTIONS ---------------------------------------------------------- //
function initializeHTML() {
	initializeScoreboardDiv();
	initializeLevelDiv();
	initializeAlertsDiv();
}

function initializeScoreboardDiv(trigram, goalScore) {
	var scoreboard = appendNewDivtoParent("scoreboard", "game");

	var trigramWidget = createWidget(divID.TRIGRAM, trigram);
	scoreboard.appendChild(trigramWidget);

	var scoreWidget = createWidget(divID.SCORE, 0);
	scoreboard.appendChild(scoreWidget);
}

function initializeLevelDiv() {
	var level = appendNewDivtoParent("level", "game");

	var widget_numRequiredLetters = createWidget(
		divID.NUM_LETTERS_REQUIRED,
		""
	);
	level.appendChild(widget_numRequiredLetters);

	var widget_numTypedLetters = createWidget(divID.NUM_LETTERS_TYPED, "");
	level.appendChild(widget_numTypedLetters);

	var widget_letters = createWidget(divID.LETTERS, "");
	level.appendChild(widget_letters);
}

function initializeAlertsDiv() {
	var alert = appendNewDivtoParent("alerts", "game");
	var alertWidget = createWidget(divID.ALERT, "");
	alert.appendChild(alertWidget);
}

// HELPER  -------------------------------------------------------- //
function getTrigram() {
	return "CAR";
}

function getMaxWordLength(trigram) {
	return 15;
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

function appendNewDivtoParent(newDivID, parentID) {
	const parent = document.getElementById(parentID);
	const newDiv = document.createElement("div");
	newDiv.setAttribute("id", newDivID);
	parent.appendChild(newDiv);
	return document.getElementById(newDivID);
}

// BELONGS IN OTHER FILES -------------------------------------------------- //
