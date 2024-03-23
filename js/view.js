// UP NEXT:
// -Load post-bonus state when refreshing after completing
// -Show round title upon game reload (even if in middle of round. UNLESS it's end of round 3 and I'm about to show You Win screen)

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
const UI_STATE = {
	levelsCompleted: 0,
	nextLetterIndex: 0,
	bonusGameInvoked: false,
	isInitialReloadState: false,

	startGame: function (trigram, wordsProvided) {
		//initialize UI
		setTrigramHeader(trigram);
		initializeStats(wordsProvided);

		//resume game if it's already begun
		if (wordsProvided.length > 0) {
			this.isInitialReloadState = true;
			skipAllModalScreens();

			//fill in all provided words
			for (
				let wordIndex = 0;
				wordIndex < wordsProvided.length;
				wordIndex++
			) {
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

			//Move app to the current round (or show YOU WIN overlay)
			var roundNum;
			if (this.levelsCompleted == 9) {
				showYouWinScreen();
				roundNum = 3;
			} else if (this.levelsCompleted == 12) {
				roundNum = 4;
			} else {
				roundNum = Math.floor(this.levelsCompleted / 3) + 1;
			}
			appDiv.classList = "round-" + roundNum;
		}
	},

	startLevel: function () {
		// console.log(
		// 	"starting level",
		// 	this.levelsCompleted,
		// 	arguments.callee.caller
		// );

		//Start accepting user input
		startInteraction();

		const roundNum = Math.floor(this.levelsCompleted / 3) + 1;
		const roundDiv = roundDivs[roundNum - 1];

		//If level is end of pre-bonus game, end game
		if (this.levelsCompleted == 9 && !this.bonusGameInvoked) {
			showYouWinScreen();
			return;
		}

		//If level is end of post-bonus game, show "incredible" alert and show stats
		if (this.levelsCompleted == 12) {
			this.endGame();
			return;
		}

		//If level is the start of a new round
		if (this.levelsCompleted % 3 == 0) {
			//If round 1 or reloading game, then begin the round right away
			if (
				this.levelsCompleted == 0 ||
				(this.isInitialReloadState && this.levelsCompleted != 9)
			) {
				appDiv.classList = "";
				appDiv.classList.add("round-" + roundNum);
				showRoundTitle(roundNum);
				this.isInitialReloadState = false;
			}
			//If round >1, wait a bit before sliding to next round
			//(so you have a chance to see all 3 words in completed state)
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

		//Highlight the current level (level)
		levelDiv = roundDiv.querySelector(
			`div.level:nth-child(${(this.levelsCompleted % 3) + 1})`
		);
		levelDiv.classList.remove("locked");
		levelDiv.classList.add("active");

		wordDiv = levelDiv.querySelector(".word");
		const letters = wordDiv.querySelectorAll(".letter");
		letters.forEach((letter) => {
			letter.classList.add("empty");
			letter.textContent = "?"; //so that letter divs have a height
		});
		this.nextLetterIndex = 0;
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
		addToStatsWordList(word);
		clearAlerts();
	},

	handleInvalidGuess: function (errorString) {
		showAlert(errorString);
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

function showAlert(alertText) {
	alertDiv.textContent = alertText;
	alertDiv.classList = "message shown";
	if (alertText != youWinString) {
		shakeLevel();
	}
}

function showRoundTitle(roundNum) {
	// console.log("showing round title", arguments.callee.caller);

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

function startBonusGame() {
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
	trigramElement.textContent = trigram.split("").join(" ");
}

function disableKeyboardUI() {
	const keyboard = document.getElementById("keyboard");
	keyboard.classList.add("disabled");
}
