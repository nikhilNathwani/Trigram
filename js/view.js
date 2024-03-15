// UP NEXT:
// -Title screen (and temp toggle-off for testing)
// -Accepted word/round animation
//

// MAIN THREAD ------------------------------------------------------------- //
var targetsCompleted = 0;
var nextLetterIndex = 0;

const roundTitles = [
	"Round I of III",
	"Round II of III",
	"Final Round!",
	"BONUS!",
];
var youWinScreenShown = false;
const youWinString = "INCREDIBLE!";

// MAIN FUNCTIONS ---------------------------------------------------------- //
const UI_STATE = {
	app: document.getElementById("app"),
	alert: document.getElementById("message"),
	rounds: document.querySelectorAll(".round"),
	target: null,
	word: null,

	newGame: function () {
		initializeStats();
	},

	resumeGame: function (wordsProvided) {
		skipAllModalScreens();
		initializeStats(wordsProvided);
		for (let wordIndex = 0; wordIndex < wordsProvided.length; wordIndex++) {
			//Skip initial null entries
			if (!wordsProvided[wordIndex]) {
				continue;
			}

			//Get the current target and mark as complete
			this.target = document.getElementById("target-" + wordIndex);
			setTargetComplete();

			//Fill in the letters for the completed target
			this.word = this.target.querySelector(".word");
			const letters = this.word.querySelectorAll(".letter");
			letters.forEach((letter, letterIndex) => {
				letter.textContent = wordsProvided[wordIndex][letterIndex]; //so that letter divs have a height
			});
		}
		//Move app to the current round
		const roundNum = Math.floor(targetsCompleted / 3) + 1;
		this.app.classList = "round-" + roundNum;

		//If pre-bonus game was just completed, show You Win
		if (targetsCompleted == 9) {
			this.endPreBonusGame();
		}
	},

	startLevel: function () {
		const roundNum = Math.floor(targetsCompleted / 3) + 1;
		const roundDiv = this.rounds[roundNum - 1];

		//If level is end of pre-bonus game, end game
		if (targetsCompleted == 9 && !youWinScreenShown) {
			this.endPreBonusGame();
			return;
		}

		//If level is the start of a new round
		if (targetsCompleted % 3 == 0) {
			//If round 1 then begin the round right away
			if (targetsCompleted == 0) {
				this.app.classList = "";
				this.app.classList.add("round-" + roundNum);
			}
			//If round >1, wait a bit before sliding to next round
			//(so you have a chance to see all 3 words in completed state)
			else {
				setTimeout(() => {
					this.app.classList = "";
					this.app.classList.add("round-" + roundNum);
					this.app.classList.add("round-transition");
					this.app.addEventListener("transitionend", () => {
						this.app.classList.remove("round-transition");
					});
				}, 350);
			}
		}

		//Highlight the current target (level)
		this.target = roundDiv.querySelector(
			`div.target:nth-child(${(targetsCompleted % 3) + 1})`
		);
		this.target.classList.remove("locked");
		this.target.classList.add("active");

		this.word = this.target.querySelector(".word");
		const letters = this.word.querySelectorAll(".letter");
		letters.forEach((letter) => {
			letter.classList.add("empty");
			letter.textContent = "?"; //so that letter divs have a height
		});
		nextLetterIndex = 0;
	},

	addLetter: function (letter) {
		this.clearAlerts();

		const nextLetter = this.word.querySelector(
			`.letter:nth-child(${nextLetterIndex + 1})`
		);
		nextLetter.textContent = letter;
		nextLetter.classList.remove("empty");
		nextLetterIndex++;
	},

	deleteLetter: function () {
		this.clearAlerts();

		const latestLetter = this.word.querySelector(
			`.letter:nth-child(${nextLetterIndex})`
		);
		latestLetter.classList.add("empty");
		latestLetter.textContent = "?"; //so letter cell has a height
		nextLetterIndex--;
	},

	handleValidGuess: function (word) {
		setTargetComplete();
		addToStatsWordList(word);
		this.clearAlerts();
	},

	handleInvalidGuess: function (errorString) {
		this.setAlert(errorString);
		this.shakeTarget();
	},

	endPreBonusGame: function () {
		showYouWinScreen();
	},

	startBonusGame: function () {
		hideYouWinScreen();
		youWinScreenShown = true;
		stopInteraction();
		setTimeout(() => {
			this.startLevel();
			startInteraction();
		}, 1000);
	},

	endGame: function () {
		this.setAlert(youWinString);
		setTimeout(() => {
			showStatsScreen();
		}, 2000);
	},

	// HELPER FUNCTIONS -------------------------------------------------------- //
	shakeTarget: function () {
		this.target.classList.add("shake");
		this.target.addEventListener(
			"animationend",
			() => {
				this.target.classList.remove("shake");
			},
			{ once: true }
		);
	},

	setAlert: function (alertText) {
		this.alert.textContent = alertText;
		this.alert.classList.add("shown");
		if (alertText != youWinString) {
			this.shakeTarget();
		}
	},

	clearAlerts: function () {
		this.alert.classList.remove("shown");
		this.alert.textContent = "";
	},
};

//called when loading pre-existing game
function skipAllModalScreens() {
	trigramRevealShown = true;
	document.querySelectorAll(".screen").forEach((screen) => {
		screen.style.display = "none";
	});
}

function setTargetComplete() {
	UI_STATE.target.querySelector(".length").innerHTML =
		'<i class="fa-solid fa-check"></i>';
	UI_STATE.target.classList = "target complete";
	targetsCompleted++;
}
