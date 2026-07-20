import {
	loadTrigramCalendar,
	getGameID,
	trigram_calendar,
} from "./calendar.js";
import { loadWordList, validateWord } from "./wordChecker.js";
import { loadGameState, saveGameState } from "./storage.js";

/*  ------------------------------------------------------------- */
export const wordLength_start = 4;
const wordLength_max = 15;

// Live-binding exports: anyone who does `import { trigram } from "./game.js"`
// always sees the current value, no object wrapper needed to stay in sync.
// wordList/wordLength_current/lettersProvided are read only inside this
// file, so they don't need exporting at all — trigram is the only piece of
// game state anything outside game.js (ui/stats.js) actually reads.
export let trigram;
let wordList;
let wordLength_current;
let lettersProvided;

// game.js has no idea who's listening — it just narrates what happened.
// ui/view.js and ui/stats.js each subscribe independently (see the
// "GAME EVENT SUBSCRIPTIONS" section near the top of each). Subscribers
// shouldn't assume ordering relative to each other: events fire in
// registration order, not some guaranteed priority.
export const gameEvents = new EventTarget();

// Initialize the app
async function initApp() {
	await loadTrigramCalendar();
	trigram = trigram_calendar[getGameID()];
	wordList = await loadWordList(trigram);
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
	wordLength_current = gameData
		? gameData.wordsProvided.length
		: wordLength_start;
	lettersProvided = gameData
		? gameData.wordsProvided
		: new Array(wordLength_start).fill(null);

	// 3. Inform the UI
	const wordsProvidedSoFar = lettersProvided.slice(wordLength_start);
	gameEvents.dispatchEvent(
		new CustomEvent("game:started", {
			detail: { trigram, wordsProvided: wordsProvidedSoFar },
		}),
	);

	// 4. Advance the game (if game isn't already completed)
	if (lettersProvided.length <= wordLength_max) {
		startLevel();
	}
}

function startLevel() {
	// 1. Confirm action can be performed
	//    n/a

	// 2. Perform the action
	wordLength_current = lettersProvided.length;
	lettersProvided.push("");

	// 3. Inform the UI
	gameEvents.dispatchEvent(new CustomEvent("level:started"));

	// 4. Advance the game
	//    n/a
}

export function addLetter(letter) {
	// 1. Confirm action can be performed
	var letter = letter.toUpperCase();
	var nextLetterPosition = lettersProvided[wordLength_current].length;
	if (nextLetterPosition >= wordLength_current) {
		submitGuess();
		return;
	}

	// 2. Perform the action
	lettersProvided[wordLength_current] += letter;

	// 3. Inform the UI
	gameEvents.dispatchEvent(
		new CustomEvent("letter:added", { detail: { letter } }),
	);

	// 4. Advance the game
	nextLetterPosition++;
	if (nextLetterPosition >= wordLength_current) {
		submitGuess();
	}
}

export function deleteLetter() {
	// 1. Confirm action can be performed
	var latestLetterPosition = lettersProvided[wordLength_current].length - 1;
	if (latestLetterPosition < 0) {
		return;
	}

	// 2. Perform the action
	var letterRemoved = lettersProvided[wordLength_current].slice(0, -1);
	lettersProvided[wordLength_current] = letterRemoved;

	// 3. Inform the UI
	gameEvents.dispatchEvent(new CustomEvent("letter:deleted"));

	// 4. Advance the game
	// n/a
}

export function submitGuess() {
	// 1. Confirm action can be performed
	//    n/a

	// 2. Perform the action
	var word = lettersProvided[wordLength_current];
	var [guessResult, errorCode] = validateWord(
		word,
		trigram,
		wordLength_current,
		wordList,
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
	saveGameState({ trigram, lettersProvided });

	// 3. Inform the UI
	gameEvents.dispatchEvent(
		new CustomEvent("guess:valid", { detail: { word } }),
	);

	// 4. Advance the game
	if (wordLength_current == wordLength_max) {
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
			detail: { errorCode, wordLength: wordLength_current, trigram },
		}),
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
