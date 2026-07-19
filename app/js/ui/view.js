import { getGameIDString } from "../calendar.js";
import { startInteraction, stopInteraction } from "../interactionHandler.js";
import {
	showYouWinScreen,
	hideYouWinScreen,
	showStatsScreen,
	skipAllModalScreens,
	isAnyScreenShown,
	setTrigramRevealScreen,
} from "./modal.js";
import { gameEvents } from "../game.js";

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

// MAIN FUNCTIONS ---------------------------------------------------------- //
export const UI_STATE = {
	levelsCompleted: 0,
	nextLetterIndex: 0,
	bonusGameInvoked: false,
	isInitialReloadState: false,

	startGame: function (trigram, wordsProvided) {
		//I) Initialize UI
		setTrigramRevealScreen(trigram);
		setTrigramHeader(trigram);

		//II) Resume game if it's already begun
		if (wordsProvided.length > 0) {
			// 1) Skip title screen & trigram reveal screen
			this.isInitialReloadState = true;
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
			if (this.levelsCompleted == 9) {
				appDiv.classList = "round-3";
				showYouWinScreen();
			}
			//
			// Exception B) Post-bonus game completed
			else if (this.levelsCompleted == 12) {
				appDiv.classList = "round-4";
				this.endGame();
			}
			//
			else {
				const roundNum = Math.floor(this.levelsCompleted / 3) + 1;
				appDiv.classList = "round-" + roundNum;
			}
		}
	},

	startLevel: function () {
		// 1) Set level to active
		const roundNum = Math.floor(this.levelsCompleted / 3) + 1;
		const roundDiv = roundDivs[roundNum - 1];
		levelDiv = roundDiv.querySelector(
			`div.level:nth-child(${(this.levelsCompleted % 3) + 1})`
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
		this.nextLetterIndex = 0;
		startInteraction();

		// 3) Advance to next round if needed
		if (this.levelsCompleted % 3 == 0) {
			//Case A) Round 4 but need to see YOU WIN screen first:
			//- Show You Win screen
			if (this.levelsCompleted == 9 && !this.bonusGameInvoked) {
				showYouWinScreen();
			}
			//Case B) Round 1 or Reloading at start of Round 2/3:
			//- Begin the round (without round-transition animation)
			//- Display Round Title
			else if (this.levelsCompleted == 0 || this.isInitialReloadState) {
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
		this.isInitialReloadState = false;
	},

	addLetter: function (letter) {
		clearAlerts();

		const nextLetter = wordDiv.querySelector(
			`.letter:nth-child(${this.nextLetterIndex + 1})`
		);
		nextLetter.textContent = letter;
		nextLetter.classList.remove("empty");
		this.nextLetterIndex++;
	},

	deleteLetter: function () {
		clearAlerts();

		const latestLetter = wordDiv.querySelector(
			`.letter:nth-child(${this.nextLetterIndex})`
		);
		latestLetter.classList.add("empty");
		latestLetter.textContent = "?"; //so letter cell has a height
		this.nextLetterIndex--;
	},

	handleValidGuess: function (word) {
		stopInteraction();
		setLevelComplete();
		clearAlerts();
	},

	handleInvalidGuess: function (errorCode, wordLength, trigram) {
		showAlert(lookupErrorString(errorCode, wordLength, trigram));
	},

	endGame: function () {
		showAlert(youWinString);
		stopInteraction();
		disableKeyboardUI();
		setTimeout(() => {
			showStatsScreen();
		}, 2000);
	},
};

// GAME EVENT SUBSCRIPTIONS ------------------------------------------------ //
// game.js narrates what happened; it has no idea view.js is listening.
// ui/stats.js subscribes to the same events independently — see its own
// "GAME EVENT SUBSCRIPTIONS" section. Don't assume ordering between the two.
gameEvents.addEventListener("game:started", (e) =>
	UI_STATE.startGame(e.detail.trigram, e.detail.wordsProvided)
);
gameEvents.addEventListener("level:started", () => UI_STATE.startLevel());
gameEvents.addEventListener("letter:added", (e) =>
	UI_STATE.addLetter(e.detail.letter)
);
gameEvents.addEventListener("letter:deleted", () => UI_STATE.deleteLetter());
gameEvents.addEventListener("guess:valid", (e) =>
	UI_STATE.handleValidGuess(e.detail.word)
);
gameEvents.addEventListener("guess:invalid", (e) =>
	UI_STATE.handleInvalidGuess(e.detail.errorCode, e.detail.wordLength, e.detail.trigram)
);
gameEvents.addEventListener("game:ended", () => UI_STATE.endGame());

// HELPER FUNCTIONS -------------------------------------------------------- //
function setLevelComplete() {
	levelDiv.querySelector(".length").innerHTML =
		'<i class="fa-solid fa-check"></i>';
	levelDiv.classList = "level complete";
	UI_STATE.levelsCompleted++;
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
	UI_STATE.bonusGameInvoked = true;
	stopInteraction();
	setTimeout(() => {
		UI_STATE.startLevel();
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
