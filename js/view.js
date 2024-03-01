// UP NEXT:
// -Rewatch wordle tutorial to inspire how I want to approach animations: https://www.youtube.com/watch?v=Wak7iN4JZzU&t=1641s
//
// const divID = {
// 	LEVEL: "level",
// 	TRIGRAM: "trigram",
// 	SCORE: "score",
// 	TIMER: "timer",
// 	WORD: "word",
// 	TARGET_LENGTH: "targetLength",
// 	ALERT: "message",
// };

var nextLetterIndex = 0;
// var titleScreenVisible = true;
// var titleSequenceOver = false;

var targetsCompleted = 0;

// MAIN THREAD ------------------------------------------------------------- //

// initializeHTML();

function initializeHTML() {
	initializeScoreboardDiv();
	initializeLevelDiv();
}

const UI_STATE = {
	app: document.getElementById("app"),
	rounds: document.querySelectorAll(".round"),
	target: null,
	word: null,
	// level: document.getElementById(divID.LEVEL),
	// trigram: document.getElementById(divID.TRIGRAM),
	// score: document.getElementById(divID.SCORE),
	// word: document.getElementById(divID.WORD),
	// targetLength: document.getElementById(divID.TARGET_LENGTH),
	// alert: document.getElementById(divID.ALERT),

	// MAIN FUNCTIONS ---------------------------------------------------------- //
	// startGame: function (trigram, startLength) {
	// 	this.initializeGameUI(trigram, startLength);
	// 	// console.log("Initial UI STATE:", this);
	// },

	startLevel: function (length) {
		const roundNum = Math.floor(targetsCompleted / 3) + 1;
		const roundDiv = this.rounds[roundNum - 1];

		// roundDiv.classList.remove("hidden");
		// this.rounds.forEach((round, index) => {
		// 	if (index > roundNum - 1) {
		// 		round.classList.add("hidden");
		// 	}
		// });

		if (targetsCompleted % 3 == 0) {
			this.app.classList = "";
			this.app.classList.add("round-" + roundNum);

			if (targetsCompleted > 0) {
				this.app.classList.add("round-transition");
				this.app.addEventListener("transitionend", () => {
					this.app.classList.remove("round-transition");
				});
			}
		}

		this.target = roundDiv.querySelector(
			`div.target:nth-child(${(targetsCompleted % 3) + 1})`
		);
		this.target.classList.remove("locked");
		this.target.classList.add("active");

		this.word = this.target.querySelector(".word");
		const letters = this.word.querySelectorAll(".letter");
		letters.forEach((letter) => {
			letter.classList.add("empty");
			letter.textContent = "?";
		});

		// this.incrementLevelUI(length);
		nextLetterIndex = 0;
	},

	addLetter: function (letter) {
		// this.clearAlerts();

		const nextLetter = this.word.querySelector(
			`.letter:nth-child(${nextLetterIndex + 1})`
		);
		nextLetter.textContent = letter;
		nextLetter.classList.remove("empty");
		nextLetterIndex++;
	},

	deleteLetter: function () {
		const latestLetter = this.word.querySelector(
			`.letter:nth-child(${nextLetterIndex})`
		);
		latestLetter.classList.add("empty");
		latestLetter.textContent = "?";
		nextLetterIndex--;
	},

	handleValidGuess: function (length) {
		this.target.querySelector(".length").innerHTML =
			'<i class="fa-solid fa-check"></i>';
		this.target.classList.add("complete");
		this.target.classList.remove("active");
		targetsCompleted++;

		// this.target.classList.remove("active");
		// console.log("new classlist", this.target.classList);
		// this.clearAlerts();
	},

	handleInvalidGuess: function (errorString) {
		// this.setAlert(errorString);
	},

	endGame: function () {
		this.setAlert("YOU WIN!");
	},

	// HELPER FUNCTIONS -------------------------------------------------------- //

	initializeGameUI: function (trigram, startLength) {
		this.trigram.textContent = trigram;
		this.score.textContent = 0;
		this.targetLength.textContent = startLength;
		appendLetterDivs(startLength - 1, this.word);
	},

	// incrementLevelUI: function (length) {
	// 	this.level.classList.add("fade-out-left");

	// 	setTimeout(function () {
	// 		stopInteraction();
	// 		this.targetLength.textContent = length + " letter word";
	// 		appendLetterDivs(1, this.word);
	// 		const letterDivs = this.word.querySelectorAll(".letter");
	// 		letterDivs.forEach((letterDiv) => {
	// 			letterDiv.textContent = "";
	// 		});
	// 		this.level.classList.remove("fade-out-left");
	// 		this.level.classList.add("teleport");
	// 		document.querySelector("#app").style.backgroundColor =
	// 			targetLength_colors[length];
	// 	}, 500);

	// 	setTimeout(function () {
	// 		this.level.classList.remove("teleport");
	// 	}, 600);

	// 	setTimeout(function () {
	// 		startInteraction();
	// 	}, 1100);
	// },

	setAlert: function (alertText) {
		this.alert.textContent = alertText;
	},

	clearAlerts: function () {
		this.setAlert("");
	},
};

function getTrigram() {
	return "CAR";
}

function getMaxWordLength(trigram) {
	return 15;
}

function appendLetterDivs(numLetterDivs, parentDiv) {
	for (let index = 0; index < numLetterDivs; index++) {
		const letter = document.createElement("div");
		letter.classList.add("letter");
		parentDiv.appendChild(letter);
	}
}

function appendNewDivtoParent(newDivID, parentID) {
	const parent = document.getElementById(parentID);
	const newDiv = document.createElement("div");
	newDiv.setAttribute("id", newDivID);
	parent.appendChild(newDiv);
	return document.getElementById(newDivID);
}

function initializeScoreboardDiv(trigram, goalScore) {
	this.trigram.textContent = trigram;
}

function initializeLevelDiv() {
	const targetLength = document.createElement("div");
	targetLength.id = divID.TARGET_LENGTH;
	level.append(targetLength);

	const letters = document.createElement("div");
	letters.id = divID.WORD;
	level.append(letters);

	//Adding message area to level container
	const message = document.createElement("div");
	message.id = divID.ALERT;
	level.append(message);
}
