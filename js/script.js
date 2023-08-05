// MAIN THREAD ------------------------------------------------------------- //
const GAME_STATE = {
	//Immutable vars (shouldn’t touch after initialization)
	trigram: null,
	wordLength_start: null,
	wordLength_goal: null,
	wordLength_max: null,

	//Mutable vars (will update throughout game)
	wordLength_current: null,
	lettersProvided: null,
};

const UI_STATE = {
	//Immutable elements (shouldn’t touch after initialization)
	scoreboard_trigram: document.getElementById("trigram"),
	scoreboard_goalScore: document.getElementById("goalScore"),

	//Mutable elements (will update throughout game)
	scoreboard_currentScore: document.getElementById("currentScore"),
	level_letters: null,
	level_numLettersRequired: document.getElementById("numLettersRequired"),
	level_numLettersTyped: document.getElementById("numLettersTyped"),
};

initializeGameState(6, 10);
initializeUIState();

// MAIN FUNCTIONS ---------------------------------------------------------- //
function initializeGameState(startLength, goalLength) {
	GAME_STATE.wordLength_start = startLength;
	GAME_STATE.wordLength_goal = goalLength;

	GAME_STATE.trigram = getTrigram();
	GAME_STATE.wordLength_max = getMaxWordLength(GAME_STATE.trigram);
	GAME_STATE.wordLength_current = startLength;
	GAME_STATE.lettersProvided = new Array(startLength).fill(null);
	GAME_STATE.lettersProvided.push("");

	console.log("GAME_STATE:", GAME_STATE);
}

function initializeUIState() {
	UI_STATE.scoreboard_trigram.textContent = GAME_STATE.trigram;
	UI_STATE.scoreboard_goalScore.textContent = GAME_STATE.wordLength_goal;
	UI_STATE.scoreboard_currentScore.textContent = 0;
	UI_STATE.level_numLettersRequired.textContent =
		GAME_STATE.wordLength_current;
	UI_STATE.level_numLettersTyped.textContent = 0;

	var letterContainer = document.getElementById("letters");
	for (let index = 0; index < GAME_STATE.wordLength_current; index++) {
		var letter = document.createElement("div");
		letter.classList.add("letter");
		letterContainer.appendChild(letter);
	}
	UI_STATE.level_letters = document.querySelectorAll(".letter");

	console.log("UI_STATE:", UI_STATE);
}

function addLetter(letter) {
	GAME_STATE.lettersProvided[GAME_STATE.wordLength_current] +=
		letter.toUpperCase();
	if (
		GAME_STATE.lettersProvided[GAME_STATE.wordLength_current].length ==
		GAME_STATE.wordLength_current
	) {
		submitGuess();
	}
}

function deleteLetter() {
	var letterRemoved = GAME_STATE.lettersProvided[
		GAME_STATE.wordLength_current
	].slice(0, -1);

	GAME_STATE.lettersProvided[GAME_STATE.wordLength_current] = letterRemoved;
}

function submitGuess() {
	var word = GAME_STATE.lettersProvided[GAME_STATE.wordLength_current];
	var guessResult =
		word.length == GAME_STATE.wordLength_current &&
		word.includes(GAME_STATE.trigram);
	console.log("Guess result:", guessResult);
	if (guessResult) {
		if (GAME_STATE.wordLength_current == GAME_STATE.wordLength_goal) {
			endGame();
			console.log("GAME ENDED! YOU WIN!");
		} else {
			GAME_STATE.wordLength_current += 1;
		}
	} else {
		displayError();
	}
}

function endGame() {
	stopInteraction();
}

// HELPER FUNCTIONS -------------------------------------------------------- //
function getTrigram() {
	return "CAR";
}

function getMaxWordLength(trigram) {
	return 15;
}

// BELONGS IN OTHER FILES -------------------------------------------------- //
