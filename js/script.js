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
	//Immutable vars (shouldn’t touch after initialization)
	scoreboard_trigram: null,
	scoreboard_goal: null,

	//Mutable vars (will update throughout game)
	scoreboard_currentScore: null,
	level_letters: null,
	level_letterCount: null,
};

initializeGameState();
initializeUIState();

// MAIN FUNCTIONS ---------------------------------------------------------- //
function initializeGameState() {
	initializeLettersProvided();
}

function initializeUIState() {
	return;
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
