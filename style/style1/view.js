// UP NEXT:
// -
//

const divID = {
	TRIGRAM: "trigram",
	SCORE: "score",
	WORD: "word",
	TARGET_LENGTH: "targetLength",
	ALERT: "message",
};
var nextLetterIndex = 0;

// MAIN THREAD ------------------------------------------------------------- //

initializeHTML();

function appendLetterDivs(numLetterDivs, parentDiv) {
	for (let index = 0; index < numLetterDivs; index++) {
		const letter = document.createElement("div");
		letter.classList.add("letter");
		parentDiv.append(letter);
	}
}

const UI_STATE = {
	score: document.getElementById(divID.SCORE),
	word: document.getElementById(divID.WORD),
	numRequiredLetters: document.getElementById(divID.TARGET_LENGTH),
	alert: document.getElementById(divID.ALERT),

	startGame: function (trigram, startLength) {
		document.getElementById(divID.TRIGRAM).textContent = trigram;

		this.score.textContent = 0;
		this.numRequiredLetters.textContent = startLength;
		appendLetterDivs(startLength - 1, this.word);

		nextLetterIndex = 0;

		console.log("Initial UI STATE:", this);
	},

	startLevel: function (length) {
		appendLetterDivs(1, this.word);
		const letterDivs = this.word.querySelectorAll(".letter");
		letterDivs.forEach((letterDiv) => {
			letterDiv.textContent = "";
		});
		this.numRequiredLetters.textContent = length;
		nextLetterIndex = 0;
	},

	addLetter: function (letter) {
		this.alert.textContent = "";

		const nextLetter = this.word.querySelector(
			`.letter:nth-child(${nextLetterIndex + 1})`
		);
		nextLetter.textContent = letter;
		nextLetterIndex += 1;
	},

	deleteLetter: function () {
		const latestLetter = this.word.querySelector(
			`.letter:nth-child(${nextLetterIndex})`
		);
		latestLetter.textContent = "";
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
	trigramWidget.classList.add("scoreboard-widget");
	scoreboard.appendChild(trigramWidget);

	var scoreWidget = createWidget(divID.SCORE, 0);
	scoreWidget.classList.add("scoreboard-widget");

	scoreboard.appendChild(scoreWidget);
}

function initializeLevelDiv() {
	var level = appendNewDivtoParent("level", "game");

	const letters = document.createElement("div");
	letters.id = divID.WORD;
	level.append(letters);

	const numRequiredLetters = document.createElement("div");
	numRequiredLetters.id = divID.TARGET_LENGTH;
	level.append(numRequiredLetters);
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
	titleElement.classList.add("widget-title");
	titleElement.id = widgetType + "Title";
	titleElement.textContent = widgetType;
	widgetWrapper.appendChild(titleElement);

	//Create widget value element (trigram or current score/goal score)
	var valueElement = document.createElement("p");
	valueElement.classList.add("widget-value");
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
