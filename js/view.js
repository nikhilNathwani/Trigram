// STATE VARIABLES ------------------------------------------------------------- //
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
		this.level_letters = document.querySelectorAll(".letter");
		console.log("Initial UI_STATE:", UI_STATE);
	},

	startLevel: function (length) {
		addLetterDivs(1);
		this.level_letters = document.querySelectorAll(".letter");
		this.level_letters.forEach((letterDiv) => (letterDiv.textContent = ""));
		this.level_numLettersRequired.textContent = length;
		this.level_numLettersTyped.textContent = 0;
	},

	addLetter: function (letter, position) {
		this.level_letters[position].textContent = letter;
		this.level_numLettersTyped.textContent = position + 1;
	},

	deleteLetter: function (position) {
		this.level_letters[position].textContent = "";
		this.level_numLettersTyped.textContent = position;
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
