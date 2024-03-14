// UP NEXT:
// -
//

/* MAIN THREAD ------------------------------------------------------------- */
const trigrams = ["CAT", "ING", "MIS", "RED"];
const startDate = new Date(2024, 2, 14);
const msOffset = Date.now() - startDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const trigramIndex = Math.floor(dayOffset);

const GAME_STATE = {
	//Immutable vars (shouldn’t touch after initialization)
	trigram: trigrams[trigramIndex],
	wordLength_start: 4,
	wordLength_max: 15,
};
//Mutable vars (will update throughout game)
GAME_STATE.wordLength_current = GAME_STATE.wordLength_start;
GAME_STATE.lettersProvided = new Array(GAME_STATE.wordLength_start).fill(null);

// GAME_STATE.lettersProvided.push("");

startGame(GAME_STATE.wordLength_start);

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
	//    Done as part of #2

	// 2. Perform the action
	if (isGameStarted()) {
		console.log("loading");
		loadGameState();
		UI_STATE.loadGame(GAME_STATE.lettersProvided);
	} else {
		console.log("initializing");
		saveGameState();
		UI_STATE.startLevel(GAME_STATE.wordLength_current);
	}

	// 3. Inform the UI
	//    Done as part of #2

	// 4. Advance the game
	startInteraction();
	startLevel();
}

function startLevel() {
	// 1. Confirm action can be performed
	//    n/a

	// 2. Perform the action
	GAME_STATE.lettersProvided.push("");
	GAME_STATE.wordLength_current = GAME_STATE.lettersProvided.length - 1;

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
	nextLetterPosition++;
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
	saveGameState();

	// 3. Inform the UI
	UI_STATE.handleValidGuess(
		GAME_STATE.lettersProvided[GAME_STATE.wordLength_current]
	);

	// 4. Advance the game
	if (GAME_STATE.wordLength_current == GAME_STATE.wordLength_max) {
		endGame();
	} else {
		startLevel();
	}
}

function handleInvalidGuess(errorReason) {
	// 1. Confirm action can be performed
	// n/a

	// 2. Perform the action
	// tbd

	// 3. Inform the UI
	UI_STATE.handleInvalidGuess(errorReason);

	// 4. Advance the game
	// n/a
}

function submitGuess() {
	var word = GAME_STATE.lettersProvided[GAME_STATE.wordLength_current];
	var [guessResult, errorReason] = validateWord(word);
	// console.log(errorReason);
	if (guessResult) {
		handleValidGuess();
	} else {
		handleInvalidGuess(errorReason);
	}
}

function endGame() {
	// 1. Confirm action can be performed
	//    n/a

	// 2. Perform the action
	// console.log("GAME ENDED! YOU WIN!");
	stopInteraction();

	// 3. Inform the UI
	UI_STATE.endGame();

	// 4. Advance the game
	//    tbd
}

/* LOCAL STORAGE ------------------------------------------------------------- */

//Returns null if gameData doesn't exist
function getGameState() {
	if (!localStorage.getItem(trigramIndex)) {
		return null;
	}
	return JSON.parse(localStorage.getItem(trigramIndex));
}

function saveGameState() {
	localStorage.setItem(
		trigramIndex,
		JSON.stringify({
			trigram: GAME_STATE.trigram,
			wordsProvided: GAME_STATE.lettersProvided,
		})
	);
}

function isGameStarted() {
	const gameData = getGameState();
	return (
		gameData != null &&
		gameData.wordsProvided.length > GAME_STATE.wordLength_start
	);
}

function loadGameState() {
	const gameData = getGameState();
	GAME_STATE.trigram = gameData.trigram;
	GAME_STATE.wordLength_current = gameData.wordsProvided.length;
	GAME_STATE.lettersProvided = gameData.wordsProvided;
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
