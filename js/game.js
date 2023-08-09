// UP NEXT:
// -
//

/* MAIN THREAD ------------------------------------------------------------- */
const GAME_STATE = {
	//Immutable vars (shouldn’t touch after initialization)
	trigram: null,
	wordLength_start: null,
	wordLength_max: null,

	//Mutable vars (will update throughout game)
	wordLength_current: null,
	lettersProvided: null,
};

startGame(6);

/* GAME EVENTS ------------------------------------------------------------ */
//  (1) Start Game
//  (2) Start Level
//  (3) Add Letter
//  (4) Delete Letter
//  (5) Handle Valid Guess
//  (6) Handle Invalid Guess
//  (7) End Game
//
//  Events consist of the following steps:
//      1. Confirm action can be performed
//      2. Perform the action
//      3. Inform the UI
//      4. Advance the game

function startGame(startLength) {
	// 1. Confirm action can be performed
	//    n/a

	// 2. Perform the action
	GAME_STATE.trigram = getTrigram();
	GAME_STATE.wordLength_max = getMaxWordLength(GAME_STATE.trigram);
	GAME_STATE.wordLength_start = startLength;
	GAME_STATE.wordLength_current = startLength - 1;
	GAME_STATE.lettersProvided = new Array(startLength).fill(null);
	console.log("Initial GAME_STATE:", GAME_STATE);

	// 3. Inform the UI
	UI_STATE.startGame(
		GAME_STATE.trigram,
		startLength,
		GAME_STATE.wordLength_max
	);

	// 4. Advance the game
	startLevel();
}

function startLevel() {
	// 1. Confirm action can be performed
	//    n/a

	// 2. Perform the action
	GAME_STATE.wordLength_current += 1;
	GAME_STATE.lettersProvided.push("");

	// 3. Inform the UI
	UI_STATE.startLevel(GAME_STATE.wordLength_current);

	// 4. Advance the game
	startInteraction(); //i.e. start listening for user input
}

function addLetter(letter) {
	// 1. Confirm action can be performed
	var letter = letter.toUpperCase();
	var nextLetterPosition =
		GAME_STATE.lettersProvided[GAME_STATE.wordLength_current].length;
	if (nextLetterPosition >= GAME_STATE.wordLength_current) {
		submitGuess();
		return;
	}

	// 2. Perform the action
	GAME_STATE.lettersProvided[GAME_STATE.wordLength_current] += letter;

	// 3. Inform the UI
	UI_STATE.addLetter(letter);

	// 4. Advance the game
	nextLetterPosition =
		GAME_STATE.lettersProvided[GAME_STATE.wordLength_current].length;
	if (nextLetterPosition >= GAME_STATE.wordLength_current) {
		submitGuess();
	}
}

function deleteLetter() {
	// 1. Confirm action can be performed
	var latestLetterPosition =
		GAME_STATE.lettersProvided[GAME_STATE.wordLength_current].length - 1;
	if (latestLetterPosition < 0) {
		return;
	}

	// 2. Perform the action
	var letterRemoved = GAME_STATE.lettersProvided[
		GAME_STATE.wordLength_current
	].slice(0, -1);
	GAME_STATE.lettersProvided[GAME_STATE.wordLength_current] = letterRemoved;

	// 3. Inform the UI
	UI_STATE.deleteLetter();

	// 4. Advance the game
	// n/a
}

function handleValidGuess() {
	// 1. Confirm action can be performed
	// n/a

	// 2. Perform the action
	stopInteraction();

	// 3. Inform the UI
	UI_STATE.handleValidGuess();

	// 4. Advance the game
	if (GAME_STATE.wordLength_current == GAME_STATE.wordLength_max) {
		endGame();
	} else {
		startLevel();
	}
}

function handleInvalidGuess() {
	// 1. Confirm action can be performed
	// n/a

	// 2. Perform the action
	displayError();

	// 3. Inform the UI
	UI_STATE.handleInvalidGuess("Placeholder error string");

	// 4. Advance the game
	// n/a
}

function submitGuess() {
	var word = GAME_STATE.lettersProvided[GAME_STATE.wordLength_current];
	var guessResult =
		word.length == GAME_STATE.wordLength_current &&
		word.includes(GAME_STATE.trigram);
	if (guessResult) {
		handleValidGuess();
	} else {
		handleInvalidGuess();
	}
}

function endGame() {
	// 1. Confirm action can be performed
	//    n/a

	// 2. Perform the action
	console.log("GAME ENDED! YOU WIN!");
	stopInteraction();

	// 3. Inform the UI
	UI_STATE.endGame();

	// 4. Advance the game
	//    tbd
}

// -----------------------------------------------
function getTrigram() {
	return "CAR";
}

function getMaxWordLength(trigram) {
	return 8;
}

function printGameState() {
	for (let key in GAME_STATE) {
		console.log(key, GAME_STATE[key]);
	}
}

// -- APPENDIX -----------------------------------
/*
Flow between the different files:
    (1) interactionHandler: "user wants to add letter"
    (2) game: "lemme check if they can"
    (3) game: "ok, user can add letter. I'll update the game state. uiManager, can you update the UI accordingly"
    (4) uiManager: "ok!"
    (5) game: "thanks! once you're done, I'll move the game to the next step"
    (6) uiManager: "ok, I'll let you know... [done now] ok done!"
    (7) game: "thanks! Now I'm moving the game to the next step"
*/
