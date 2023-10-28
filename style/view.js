// UP NEXT:
// -Rewatch wordle tutorial to inspire how I want to approach animations: https://www.youtube.com/watch?v=Wak7iN4JZzU&t=1641s
//
const divID = {
	LEVEL: "level",
	TRIGRAM: "trigram",
	SCORE: "score",
	TIMER: "timer",
	WORD: "word",
	TARGET_LENGTH: "targetLength",
	ALERT: "message",
};
const targetLength_colors = {
	4: "#1976D2",
	5: "#388E3C",
	6: "#D32F2F",
	7: "#7B1FA2",
	8: "#FBC02D",
	9: "#E64A19",
	10: "#689F38",
	11: "#FFA000",
	12: "#0277BD",
	13: "#558B2F",
	14: "#C2185B",
	15: "#FF6F00",
	16: "#512DA8",
	17: "#F57C00",
	18: "#1976D2",
	19: "#388E3C",
	20: "#D32F2F",
	21: "#7B1FA2",
	22: "#FBC02D",
	23: "#E64A19",
	24: "#689F38",
	25: "#FFA000",
};
var nextLetterIndex = 0;

// MAIN THREAD ------------------------------------------------------------- //

initializeHTML();

function initializeHTML() {
	initializeScoreboardDiv();
	initializeLevelDiv();
}

const UI_STATE = {
	level: document.getElementById(divID.LEVEL),
	trigram: document.getElementById(divID.TRIGRAM),
	score: document.getElementById(divID.SCORE),
	word: document.getElementById(divID.WORD),
	targetLength: document.getElementById(divID.TARGET_LENGTH),
	alert: document.getElementById(divID.ALERT),

	// MAIN FUNCTIONS ---------------------------------------------------------- //
	startGame: function (trigram, startLength) {
		this.initializeGameUI(trigram, startLength);
		// console.log("Initial UI STATE:", this);
	},

	startLevel: function (length) {
		this.incrementLevelUI(length);
		nextLetterIndex = 0;
	},

	addLetter: function (letter) {
		this.clearAlerts();

		const nextLetter = this.word.querySelector(
			`.letter:nth-child(${nextLetterIndex + 1})`
		);
		nextLetter.textContent = letter;
		nextLetterIndex += 1;
	},

	deleteLetter: function () {
		const latestLetter = this.word.querySelector(
			`.letter:nth-child(${nextLetterIndex})`
		);
		latestLetter.textContent = "";
		nextLetterIndex -= 1;
	},

	handleValidGuess: function (length) {
		this.score.textContent = length;
		this.clearAlerts();
	},

	handleInvalidGuess: function (errorString) {
		this.setAlert(errorString);
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

	incrementLevelUI: function (length) {
		this.level.classList.add("fade-out-left");

		// After a delay, update the level content and add the 'fade-in-right' class to bring it back from the right
		setTimeout(function () {
			stopInteraction();
			this.targetLength.textContent = length + " letters";
			this.targetLength.style.backgroundColor =
				targetLength_colors[length];
			appendLetterDivs(1, this.word);
			const letterDivs = this.word.querySelectorAll(".letter");
			letterDivs.forEach((letterDiv) => {
				letterDiv.textContent = "";
				letterDiv.style.borderColor = targetLength_colors[length];
			});
			this.level.classList.remove("fade-out-left");
			this.level.classList.add("teleport");
		}, 500); // Adjust the delay to match your transition duration

		setTimeout(function () {
			this.level.classList.remove("teleport");
			// this.level.classList.add("fade-in-right");
		}, 600); // Adjust the delay to match your transition duration

		setTimeout(function () {
			// this.level.classList.remove("fade-in-right");
			startInteraction();
		}, 1100); // Adjust the delay to match your transition duration
	},

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
	var level = appendNewDivtoParent("level", "game");

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
// BELONGS IN OTHER FILES -------------------------------------------------- //
