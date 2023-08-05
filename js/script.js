// MAIN THREAD ------------------------------------------------------------- //
const GAME_STATE = {
	//Immutable vars (shouldn’t touch after initialization)
	trigram: "CAR",
	wordLength_start: 5,
	wordLength_goal: 10,
	wordLength_max: 15,

	//Mutable vars (will update throughout game)
	wordLength_current: 5,
	lettersProvided: [],
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

initializeGameState();
initializeUIState();

// MAIN FUNCTIONS ---------------------------------------------------------- //
function initializeGameState() {
	initializeLettersProvided();

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

// HELPER FUNCTIONS -------------------------------------------------------- //
function initializeLettersProvided() {
	const nullArray = Array(GAME_STATE.wordLength_start).fill(null);
	const emptyStringArray = Array(
		GAME_STATE.wordLength_max - GAME_STATE.wordLength_start + 1
	).fill("");
	const resultArray = [...nullArray, ...emptyStringArray];
	GAME_STATE.lettersProvided = resultArray;
}

function endGame() {
	stopInteraction();
}

// BELONGS IN OTHER FILES -------------------------------------------------- //
