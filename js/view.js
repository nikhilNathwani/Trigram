//To Do:
// - Have level_letters query-select the #letters container, then add/delete via query-selecting it for data-letter attr, instead of having itself be the nodelist of .letter divs which can't be queried further

// STATE VARIABLES ------------------------------------------------------------- //
var nextLetterIndex = 0;

const UI_STATE = {
	//Immutable elements (shouldn’t touch after initialization)
	scoreboard_trigram: document.getElementById("trigram"),
	scoreboard_goalScore: document.getElementById("goalScore"),

	//Mutable elements (will update throughout game)
	scoreboard_currentScore: document.getElementById("currentScore"),
	level_letters: null,
	level_numLettersRequired: document.getElementById("numLettersRequired"),
	level_numLettersTyped: document.getElementById("numLettersTyped"),

	startGame: function (trigram, startLength, goalLength) {
		this.scoreboard_trigram.textContent = trigram;
		this.scoreboard_goalScore.textContent = goalLength;
		this.scoreboard_currentScore.textContent = 0;
		this.level_numLettersRequired.textContent = startLength;
		this.level_numLettersTyped.textContent = 0;
		addLetterDivs(startLength);
		this.level_letters = document.querySelector("#letters");
		nextLetterIndex = 0;
		console.log("Initial UI_STATE:", UI_STATE);
	},

	startLevel: function (length) {
		addLetterDivs(1);
		this.level_letters
			.querySelectorAll(".letter")
			.forEach((letterDiv) => (letterDiv.textContent = ""));
		this.level_numLettersRequired.textContent = length;
		nextLetterIndex = 0;
		this.level_numLettersTyped.textContent = nextLetterIndex;
	},

	addLetter: function (letter) {
		const nextLetterDiv = this.level_letters.querySelector(
			`.letter:nth-child(${nextLetterIndex + 1})`
		); //offset by 1 because nth-child is 1-indexed, not 0-indexed
		nextLetterDiv.textContent = letter;
		nextLetterIndex += 1;
		this.level_numLettersTyped.textContent = nextLetterIndex;
	},

	deleteLetter: function () {
		const lastTypedLetterDiv = this.level_letters.querySelector(
			`.letter:nth-child(${nextLetterIndex})`
		); //offset by 1 because nth-child is 1-indexed, not 0-indexed
		lastTypedLetterDiv.textContent = "";
		this.level_numLettersTyped.textContent = nextLetterIndex - 1;
		nextLetterIndex -= 1;
	},

	handleValidGuess: function () {
		return;
	},

	handleInvalidGuess: function (errorString) {
		return;
	},

	endLevel: function (length) {
		this.scoreboard_currentScore.textContent = length;
	},

	endGame: function () {
		return;
	},
};

// MAIN FUNCTIONS ---------------------------------------------------------- //

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
