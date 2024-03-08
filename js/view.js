// UP NEXT:
// -Title screen (and temp toggle-off for testing)
// -Accepted word/round animation
//

// MAIN THREAD ------------------------------------------------------------- //
var nextLetterIndex = 0;
// var titleScreenVisible = true;
// var titleSequenceOver = false;

var targetsCompleted = 0;
var roundTitles = [
	"Round I of III",
	"Round II of III",
	"Final Round!",
	"BONUS!",
];
var youWinString = "YOU WIN!";

// MAIN FUNCTIONS ---------------------------------------------------------- //
const UI_STATE = {
	app: document.getElementById("app"),
	rounds: document.querySelectorAll(".round"),
	target: null,
	word: null,
	alert: document.getElementById("message"),
	roundTitle: document.getElementById("roundTitle"),

	startLevel: function (length) {
		const roundNum = Math.floor(targetsCompleted / 3) + 1;
		const roundDiv = this.rounds[roundNum - 1];

		//If level is the start of a new round
		if (targetsCompleted % 3 == 0) {
			//If round 1 then begin the round right away
			if (targetsCompleted == 0) {
				this.app.classList = "";
				this.app.classList.add("round-" + roundNum);
				this.roundTitle.textContent =
					roundTitles[Math.floor(targetsCompleted / 3)];
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
						this.roundTitle.textContent =
							roundTitles[Math.floor(targetsCompleted / 3)];
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
		this.target.querySelector(".length").innerHTML =
			'<i class="fa-solid fa-check"></i>';

		this.target.classList.add("complete");
		this.target.classList.remove("active");
		targetsCompleted++;

		addToStatsWordList(word);

		this.clearAlerts();
	},

	handleInvalidGuess: function (errorString) {
		this.setAlert(errorString);
		this.shakeTarget();
	},

	endGame: function () {
		this.setAlert(youWinString);
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
