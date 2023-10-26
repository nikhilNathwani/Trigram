// UP NEXT:
// -Rewatch wordle tutorial to inspire how I want to approach animations: https://www.youtube.com/watch?v=Wak7iN4JZzU&t=1641s
//
const divID = {
	LEVEL: "level",
	TRIGRAM: "trigram",
	SCORE: "score",
	TIMER: "timer",
	WORD: "word",
	TARGET_LENGTH: "targetLength",
	ALERT: "message",
};
var nextLetterIndex = 0;

// MAIN THREAD ------------------------------------------------------------- //

initializeHTML();

function initializeHTML() {
	initializeScoreboardDiv();
	initializeLevelDiv();
	initializeAlertsDiv();
}

const UI_STATE = {
	level: document.getElementById(divID.LEVEL),
	trigram: document.getElementById(divID.TRIGRAM),
	score: document.getElementById(divID.SCORE),
	word: document.getElementById(divID.WORD),
	targetLength: document.getElementById(divID.TARGET_LENGTH),
	alert: document.getElementById(divID.ALERT),

	// MAIN FUNCTIONS ---------------------------------------------------------- //
	startGame: function (trigram, startLength) {
		this.initializeGameUI(trigram, startLength);
		// console.log("Initial UI STATE:", this);
	},

	startLevel: function (length) {
		this.incrementLevelUI(length);
		nextLetterIndex = 0;
	},

	addLetter: function (letter) {
		this.clearAlerts();

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
		this.clearAlerts();
	},

	handleInvalidGuess: function (errorString) {
		this.setAlert(errorString);
	},

	endGame: function () {
		this.setAlert("YOU WIN!");
	},

	// HELPER FUNCTIONS -------------------------------------------------------- //

	initializeGameUI: function (trigram, startLength) {
		this.trigram.textContent = trigram;
		this.score.textContent = 0;
		this.targetLength.textContent = startLength;
		appendLetterDivs(startLength - 1, this.word);
	},

	incrementLevelUI: function (length) {
		this.level.classList.add("fade-out-left");

		// After a delay, update the level content and add the 'fade-in-right' class to bring it back from the right
		setTimeout(function () {
			stopInteraction();
			this.targetLength.textContent = length + " letters";
			appendLetterDivs(1, this.word);
			const letterDivs = this.word.querySelectorAll(".letter");
			letterDivs.forEach((letterDiv) => {
				letterDiv.textContent = "";
			});
			this.level.classList.remove("fade-out-left");
			this.level.classList.add("teleport");
		}, 500); // Adjust the delay to match your transition duration

		setTimeout(function () {
			this.level.classList.remove("teleport");
			this.level.classList.add("fade-in-right");
		}, 600); // Adjust the delay to match your transition duration

		setTimeout(function () {
			this.level.classList.remove("fade-in-right");
			startInteraction();
		}, 1100); // Adjust the delay to match your transition duration
	},

	setAlert: function (alertText) {
		this.alert.textContent = alertText;
	},

	clearAlerts: function () {
		this.setAlert("");
	},
};

function getTrigram() {
	return "CAR";
}

function getMaxWordLength(trigram) {
	return 15;
}

function appendLetterDivs(numLetterDivs, parentDiv) {
	for (let index = 0; index < numLetterDivs; index++) {
		const letter = document.createElement("div");
		letter.classList.add("letter");
		parentDiv.appendChild(letter);
	}
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

function initializeScoreboardDiv(trigram, goalScore) {
	var scoreboard = appendNewDivtoParent("scoreboard", "game");

	var scoreWidget = createWidget(divID.SCORE, 0);
	scoreWidget.classList.add("scoreboard-widget");
	scoreboard.appendChild(scoreWidget);

	var trigramWidget = createWidget(divID.TRIGRAM, trigram);
	trigramWidget.classList.add("scoreboard-widget");
	scoreboard.appendChild(trigramWidget);

	var timerWidget = createWidget(divID.TIMER, 0);
	timerWidget.classList.add("scoreboard-widget");
	scoreboard.appendChild(timerWidget);
}

function initializeLevelDiv() {
	var level = appendNewDivtoParent("level", "game");

	const targetLength = document.createElement("div");
	targetLength.id = divID.TARGET_LENGTH;
	level.append(targetLength);

	const letters = document.createElement("div");
	letters.id = divID.WORD;
	level.append(letters);
}

function initializeAlertsDiv() {
	var alert = appendNewDivtoParent("alerts", "game");
	var alertWidget = createWidget(divID.ALERT, "");
	alert.appendChild(alertWidget);
}

// BELONGS IN OTHER FILES -------------------------------------------------- //
