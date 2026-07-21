import { getGameIDString } from "../calendar.js";
import { startInteraction, stopInteraction } from "../interactionHandler.js";
import {
	showYouWinScreen,
	hideYouWinScreen,
	showStatsDialog,
	skipAllModalScreens,
	isAnyScreenShown,
	setTrigramRevealScreen,
} from "./modal.js";
import { gameEvents } from "../game.js";
import {
	LEVELS_PER_ROUND,
	LEVELS_TOTAL,
	PRE_BONUS_LEVELS_COMPLETE,
} from "../constants.js";

// UP NEXT:
// -(maybe) Show round title upon game reload (even if in middle of round. UNLESS it's end of round 3 and I'm about to show You Win screen)

//UI Elements frequently referenced
const appDiv = document.getElementById("app");
const alertDiv = document.getElementById("message");
const roundDivs = document.querySelectorAll(".round");
var levelDiv = null; //set by startLevel
var wordDiv = null; //set by startLevel

//UI Strings
const roundTitles = ["Round I", "Round II", "Final Round!", "BONUS!"];
const youWinString = "INCREDIBLE!";

// View state. Live-binding exports (see game.js for the same trick): the
// one piece anything outside this file needs — levelsCompleted, read by
// interactionHandler.js — stays correct on every read with no object
// wrapper or manual sync required.
export let levelsCompleted = 0;
let nextLetterIndex = 0;
let bonusGameInvoked = false;
let isInitialReloadState = false;

// MAIN FUNCTIONS ---------------------------------------------------------- //
// Named handle<EventName> to match the gameEvents names 1:1 (see the
// subscriptions below) and to stay unambiguous from game.js's own
// same-purpose-sounding internal functions (e.g. its private startLevel()).
function handleGameStarted(trigram, wordsProvided) {
	//I) Initialize UI
	setTrigramRevealScreen(trigram);
	setTrigramHeader(trigram);

	//II) Resume game if it's already begun
	if (wordsProvided.length > 0) {
		// 1) Skip title screen & trigram reveal screen
		isInitialReloadState = true;
		skipAllModalScreens();

		// 2) Fill in all words the user has submitted previously
		var numWords = wordsProvided.length;
		for (let wordIndex = 0; wordIndex < numWords; wordIndex++) {
			//Get the current level and mark as complete
			levelDiv = document.getElementById(
				"level-" + wordsProvided[wordIndex].length
			);
			setLevelComplete();

			//Fill in the letters for the completed level
			wordDiv = levelDiv.querySelector(".word");
			const letters = wordDiv.querySelectorAll(".letter");
			letters.forEach((letter, letterIndex) => {
				letter.textContent = wordsProvided[wordIndex][letterIndex]; //so that letter divs have a height
			});
		}

		// 3) Drop user into the round containing their next level
		//    (without doing the slide-down round transition)
		//
		// Exception A) Pre-bonus game completed
		if (levelsCompleted == PRE_BONUS_LEVELS_COMPLETE) {
			appDiv.classList = "round-3";
			showYouWinScreen();
		}
		//
		// Exception B) Post-bonus game completed
		else if (levelsCompleted == LEVELS_TOTAL) {
			appDiv.classList = "round-4";
			handleGameEnded();
		}
		//
		else {
			const roundNum = Math.floor(levelsCompleted / LEVELS_PER_ROUND) + 1;
			appDiv.classList = "round-" + roundNum;
		}
	}
}

function handleLevelStarted() {
	// 1) Set level to active
	const roundNum = Math.floor(levelsCompleted / LEVELS_PER_ROUND) + 1;
	const roundDiv = roundDivs[roundNum - 1];
	levelDiv = roundDiv.querySelector(
		`div.level:nth-child(${(levelsCompleted % LEVELS_PER_ROUND) + 1})`
	);
	levelDiv.classList.remove("locked");
	levelDiv.classList.add("active");

	// 2) Start accepting user input
	wordDiv = levelDiv.querySelector(".word");
	const letters = wordDiv.querySelectorAll(".letter");
	letters.forEach((letter) => {
		letter.classList.add("empty");
		letter.textContent = "?"; //so that letter divs have a height
	});
	nextLetterIndex = 0;
	startInteraction();

	// 3) Advance to next round if needed
	if (levelsCompleted % LEVELS_PER_ROUND == 0) {
		//Case A) Round 4 but need to see YOU WIN screen first:
		//- Show You Win screen
		if (levelsCompleted == PRE_BONUS_LEVELS_COMPLETE && !bonusGameInvoked) {
			showYouWinScreen();
		}
		//Case B) Round 1 or Reloading at start of Round 2/3:
		//- Begin the round (without round-transition animation)
		//- Display Round Title
		else if (levelsCompleted == 0 || isInitialReloadState) {
			appDiv.classList = "";
			appDiv.classList.add("round-" + roundNum);
			showRoundTitle(roundNum);
		}
		//Case C) Round 2, 3, or 4 (after YOU WIN screen):
		//- Disable typing during animation
		//- Run round-transition animation (after 350ms to see all 3 words in completed state)
		//- Display Round Title
		//- Re-enable typing
		else {
			stopInteraction();
			setTimeout(() => {
				appDiv.classList = "";
				appDiv.classList.add("round-" + roundNum);
				appDiv.classList.add("round-transition");
				appDiv.addEventListener("transitionend", () => {
					appDiv.classList.remove("round-transition");
					showRoundTitle(roundNum);
					startInteraction();
				});
			}, 350);
		}
	}

	//4) Reset isInitialReloadState to false (initial reload period ends when any level starts)
	isInitialReloadState = false;
}

function handleLetterAdded(letter) {
	clearAlerts();

	const nextLetter = wordDiv.querySelector(
		`.letter:nth-child(${nextLetterIndex + 1})`
	);
	nextLetter.textContent = letter;
	nextLetter.classList.remove("empty");
	nextLetterIndex++;
}

function handleLetterDeleted() {
	clearAlerts();

	const latestLetter = wordDiv.querySelector(
		`.letter:nth-child(${nextLetterIndex})`
	);
	latestLetter.classList.add("empty");
	latestLetter.textContent = "?"; //so letter cell has a height
	nextLetterIndex--;
}

function handleGuessValid(word) {
	stopInteraction();
	setLevelComplete();
	clearAlerts();
}

function handleGuessInvalid(errorCode, wordLength, trigram) {
	showAlert(lookupErrorString(errorCode, wordLength, trigram));
}

function handleGameEnded() {
	showAlert(youWinString);
	stopInteraction();
	disableKeyboardUI();
	setTimeout(() => {
		showStatsDialog();
	}, 2000);
}

// GAME EVENT SUBSCRIPTIONS ------------------------------------------------ //
// game.js narrates what happened; it has no idea view.js is listening.
// ui/stats.js subscribes to the same events independently — see its own
// "GAME EVENT SUBSCRIPTIONS" section. Don't assume ordering between the two.
gameEvents.addEventListener("game:started", (e) =>
	handleGameStarted(e.detail.trigram, e.detail.wordsProvided)
);
gameEvents.addEventListener("level:started", handleLevelStarted);
gameEvents.addEventListener("letter:added", (e) =>
	handleLetterAdded(e.detail.letter)
);
gameEvents.addEventListener("letter:deleted", handleLetterDeleted);
gameEvents.addEventListener("guess:valid", (e) => handleGuessValid(e.detail.word));
gameEvents.addEventListener("guess:invalid", (e) =>
	handleGuessInvalid(e.detail.errorCode, e.detail.wordLength, e.detail.trigram)
);
gameEvents.addEventListener("game:ended", handleGameEnded);

// HELPER FUNCTIONS -------------------------------------------------------- //
function setLevelComplete() {
	levelDiv.querySelector(".length").innerHTML =
		'<i class="fa-solid fa-check"></i>';
	levelDiv.classList = "level complete";
	levelsCompleted++;
}

function shakeLevel() {
	levelDiv.classList.add("shake");
	levelDiv.addEventListener(
		"animationend",
		() => {
			levelDiv.classList.remove("shake");
		},
		{ once: true }
	);
}

function lookupErrorString(errorCode, wordLength, trigram) {
	switch (errorCode) {
		case "WRONG-LENGTH":
			return `Word not ${wordLength} letters long`;
		case "TRIGRAM-MISSING":
			return `Doesn't contain ${trigram}`;
		case "NOT-FOUND":
			return "Not in word list";
		default:
			return "An unknown error occurred.";
	}
}

function showAlert(alertText) {
	alertDiv.textContent = alertText;
	alertDiv.classList = "message shown";
	if (alertText != youWinString) {
		shakeLevel();
	}
}

export function showRoundTitle(roundNum) {
	if (isAnyScreenShown()) {
		return;
	}
	alertDiv.textContent = roundTitles[roundNum - 1];
	alertDiv.classList.add("roundTitle");
	alertDiv.addEventListener(
		"animationend",
		() => {
			alertDiv.classList.remove("roundTitle");
		},
		{ once: true }
	);
}

function clearAlerts() {
	if (!alertDiv.classList.contains("roundTitle")) {
		alertDiv.classList.remove("shown");
		alertDiv.textContent = "";
	}
}

export function startBonusGame() {
	hideYouWinScreen();
	bonusGameInvoked = true;
	stopInteraction();
	setTimeout(() => {
		handleLevelStarted();
	}, 1000);
}

function setTrigramHeader(trigram) {
	const trigramHeaderTitle = document.querySelector(
		".header-title#trigram-number"
	);
	trigramHeaderTitle.textContent = "Trigram #" + getGameIDString();
	const trigramElement = document.querySelector(".header-element #trigram");
	trigramElement.innerHTML = trigram
		.split("")
		.map((char) => `<span>${char}</span>`)
		.join("");
}

function disableKeyboardUI() {
	const keyboard = document.getElementById("keyboard");
	keyboard.classList.add("disabled");
}
