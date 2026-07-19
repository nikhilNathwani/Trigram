import { DEBUG, clearCurrentGameData, setFakePastGameData } from "./debug.js";
import { loadTrigramCalendar, getGameID, trigram_calendar } from "./calendar.js";
import { loadWordList, validateWord } from "./wordChecker.js";
import { loadGameState, saveGameState } from "./storage.js";

// UP NEXT:
//

/*  ------------------------------------------------------------- */
export const wordLength_start = 4;
const wordLength_max = 15;
export const GAME_STATE = {};

// game.js has no idea who's listening — it just narrates what happened.
// ui/view.js and ui/stats.js each subscribe independently (see the
// "GAME EVENT SUBSCRIPTIONS" section near the top of each). Subscribers
// shouldn't assume ordering relative to each other: events fire in
// registration order, not some guaranteed priority.
export const gameEvents = new EventTarget();

if (DEBUG.forceNewGame) {
	clearCurrentGameData();
}
if (DEBUG.forceFakePastStats) {
	setFakePastGameData();
}

// Initialize the app
async function initApp() {
	await loadTrigramCalendar();
	GAME_STATE.trigram = trigram_calendar[getGameID()];
	GAME_STATE.wordList = await loadWordList(GAME_STATE.trigram);
	startGame();
}

initApp();

/* GAME EVENTS ------------------------------------------------------------ */
//  (1) Start Game
//  (2) Start Level
//  (3) Add Letter
//  (4) Delete Letter
//  (5) Submit Guess
//  (6) Handle Valid Guess
//  (7) Handle Invalid Guess
//  (8) End Game
//
//  Events consist of the following steps:
//      1. Confirm action can be performed
//      2. Perform the action
//      3. Inform the UI
//      4. Advance the game

function startGame() {
	// 1. Confirm action can be performed
	//    n/a

	// 2. Perform the action
	//    Load game state (or initialize to empty state)
	const gameData = loadGameState();
	GAME_STATE.wordLength_current = gameData
		? gameData.wordsProvided.length
		: wordLength_start;
	GAME_STATE.lettersProvided = gameData
		? gameData.wordsProvided
		: new Array(wordLength_start).fill(null);

	// 3. Inform the UI
	const wordsProvidedSoFar =
		GAME_STATE.lettersProvided.slice(wordLength_start);
	gameEvents.dispatchEvent(
		new CustomEvent("game:started", {
			detail: { trigram: GAME_STATE.trigram, wordsProvided: wordsProvidedSoFar },
		})
	);

	// 4. Advance the game (if game isn't already completed)
	if (GAME_STATE.lettersProvided.length <= wordLength_max) {
		startLevel();
	}
}

function startLevel() {
	// 1. Confirm action can be performed
	//    n/a

	// 2. Perform the action
	GAME_STATE.wordLength_current = GAME_STATE.lettersProvided.length;
	GAME_STATE.lettersProvided.push("");

	// 3. Inform the UI
	gameEvents.dispatchEvent(new CustomEvent("level:started"));

	// 4. Advance the game
	//    n/a
}

export function addLetter(letter) {
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
	gameEvents.dispatchEvent(new CustomEvent("letter:added", { detail: { letter } }));

	// 4. Advance the game
	nextLetterPosition++;
	if (nextLetterPosition >= GAME_STATE.wordLength_current) {
		submitGuess();
	}
}

export function deleteLetter() {
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
	gameEvents.dispatchEvent(new CustomEvent("letter:deleted"));

	// 4. Advance the game
	// n/a
}

export function submitGuess() {
	// 1. Confirm action can be performed
	//    n/a

	// 2. Perform the action
	var word = GAME_STATE.lettersProvided[GAME_STATE.wordLength_current];
	var [guessResult, errorCode] = validateWord(
		word,
		GAME_STATE.trigram,
		GAME_STATE.wordLength_current,
		GAME_STATE.wordList
	);

	// 3. Inform the UI
	//    n/a

	// 4. Advance the game
	if (guessResult) {
		handleValidGuess(word);
	} else {
		handleInvalidGuess(errorCode);
	}
}

function handleValidGuess(word) {
	// 1. Confirm action can be performed
	// n/a

	// 2. Perform the action
	saveGameState(GAME_STATE);

	// 3. Inform the UI
	gameEvents.dispatchEvent(new CustomEvent("guess:valid", { detail: { word } }));

	// 4. Advance the game
	if (GAME_STATE.wordLength_current == wordLength_max) {
		endGame();
	} else {
		startLevel();
	}
}

function handleInvalidGuess(errorCode) {
	// 1. Confirm action can be performed
	// n/a

	// 2. Perform the action
	// n/a

	// 3. Inform the UI
	gameEvents.dispatchEvent(
		new CustomEvent("guess:invalid", {
			detail: {
				errorCode,
				wordLength: GAME_STATE.wordLength_current,
				trigram: GAME_STATE.trigram,
			},
		})
	);

	// 4. Advance the game
	// n/a
}

function endGame() {
	// 1. Confirm action can be performed
	//    n/a

	// 2. Perform the action
	//    n/a

	// 3. Inform the UI
	gameEvents.dispatchEvent(new CustomEvent("game:ended"));

	// 4. Advance the game
	//    tbd
}
