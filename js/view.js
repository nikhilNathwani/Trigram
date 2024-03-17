// UP NEXT:
// -Loading game when 9 levels completed (shows round 4 instead of lingering on round 3 then showing YOU WIN screen, or just showing YOU WIN screen without lingering on round 3)
// -Stop accepting input when bonus game ends, just show stats and make it indismissable
// -Replace "level" with "level" in all files
// -Bring Round Titles back

//UI Elements frequently referenced
const appDiv = document.getElementById("app");
const alertDiv = document.getElementById("message");
const roundDivs = document.querySelectorAll(".round");
var levelDiv = null; //set by startLevel
var wordDiv = null; //set by startLevel

//UI Strings
const roundTitles = [
	"Round I of III",
	"Round II of III",
	"Final Round!",
	"BONUS!",
];
const youWinString = "INCREDIBLE!";

// MAIN FUNCTIONS ---------------------------------------------------------- //
const UI_STATE = {
	levelsCompleted: 0,
	nextLetterIndex: 0,
	bonusGameInvoked: false,

	startGame: function (trigram, wordsProvided) {
		//initialize UI
		const trigramHeaderTitle = document.querySelector(
			".header-title#trigram-number"
		);
		trigramHeaderTitle.textContent = "Trigram #" + getGameIDString();
		const trigramElement = document.querySelector(
			".header-element #trigram"
		);
		trigramElement.textContent = trigram.split("").join(" ");

		//new game
		if (wordsProvided.length == 0) {
			initializeStats();
		}
		//resume game
		else {
			skipAllModalScreens();
			initializeStats(wordsProvided);
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
			//Move app to the current round
			const roundNum = Math.floor(this.levelsCompleted / 3) + 1;
			appDiv.classList = "round-" + roundNum;

			//If pre-bonus game was just completed, show You Win
			if (this.levelsCompleted == 9) {
				showYouWinScreen();
			}
		}
	},

	startLevel: function () {
		//Start accepting user input
		startInteraction();

		const roundNum = Math.floor(this.levelsCompleted / 3) + 1;
		const roundDiv = roundDivs[roundNum - 1];

		//If level is end of pre-bonus game, end game
		if (this.levelsCompleted == 9 && !this.bonusGameInvoked) {
			showYouWinScreen();
			return;
		}

		//If level is the start of a new round
		if (this.levelsCompleted % 3 == 0) {
			//If round 1 then begin the round right away
			if (this.levelsCompleted == 0) {
				appDiv.classList = "";
				appDiv.classList.add("round-" + roundNum);
			}
			//If round >1, wait a bit before sliding to next round
			//(so you have a chance to see all 3 words in completed state)
			else {
				setTimeout(() => {
					appDiv.classList = "";
					appDiv.classList.add("round-" + roundNum);
					appDiv.classList.add("round-transition");
					appDiv.addEventListener("transitionend", () => {
						appDiv.classList.remove("round-transition");
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
		setAlert(errorString);
	},

	endGame: function () {
		setAlert(youWinString);
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

function setAlert(alertText) {
	alertDiv.textContent = alertText;
	alertDiv.classList.add("shown");
	if (alertText != youWinString) {
		shakeLevel();
	}
}

function clearAlerts() {
	alertDiv.classList.remove("shown");
	alertDiv.textContent = "";
}

function startBonusGame() {
	hideYouWinScreen();
	UI_STATE.bonusGameInvoked = true;
	stopInteraction();
	setTimeout(() => {
		UI_STATE.startLevel();
	}, 1000);
}
