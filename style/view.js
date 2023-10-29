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
	JUMBOTRON: "jumbotron",
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
	jumbotron: document.getElementById(divID.JUMBOTRON),

	// MAIN FUNCTIONS ---------------------------------------------------------- //
	startGame: function (trigram, startLength) {
		this.initializeGameUI(trigram, startLength);
		// console.log("Initial UI STATE:", this);
	},

	startLevel: function (length, isFirstLevel) {
		this.incrementLevelUI(length, isFirstLevel);
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

	handleValidGuess: function (length, trigramIndex) {
		this.score.textContent = length;
		this.animateSuccess(length, trigramIndex);
		this.clearAlerts();
	},

	handleInvalidGuess: function (errorString) {
		this.setAlert(errorString);
	},

	endGame: function () {
		this.setAlert("YOU WIN!");
	},

	// HELPER FUNCTIONS -------------------------------------------------------- //
	animateSuccess: function (targetLength, trigramIndex) {
		stopInteraction();
		let letters = this.word.children;
		let trigramLetters = [
			letters[trigramIndex],
			letters[trigramIndex + 1],
			letters[trigramIndex + 2],
		];
		trigramLetters.forEach(function (letter, index) {
			let position =
				index == 0 ? "left" : index == 1 ? "middle" : "right";
			letter.classList.add("trigram-letter");
			letter.classList.add("trigram-" + position);
			letter.style.backgroundColor = targetLength_colors[targetLength];
		});

		this.jumbotron.classList.add("scored");
		this.jumbotron.style.backgroundColor =
			targetLength_colors[targetLength];
		// this.trigram.style.backgroundColor = targetLength_colors[targetLength];

		setTimeout(function () {
			trigramLetters.forEach(function (letter, index) {
				let position =
					index == 0 ? "left" : index == 1 ? "middle" : "right";
				letter.classList.remove("trigram-letter");
				letter.classList.remove("trigram-" + position);
				letter.style.backgroundColor = "";
			});
			startInteraction();
		}, 1300);
	},

	initializeGameUI: function (trigram, startLength) {
		this.trigram.textContent = trigram;
		this.score.textContent = 0;
		this.targetLength.textContent = startLength;
		appendLetterDivs(startLength - 1, this.word);
	},

	incrementLevelUI: function (length, isFirstLevel) {
		if (isFirstLevel) {
			this.targetLength.textContent = length + " letters";
			appendLetterDivs(1, this.word);
			startInteraction();
			return;
		}

		setTimeout(function () {
			this.level.classList.add("fade-out-left");
		}, 1000);

		// After a delay, update the level content and add the 'fade-in-right' class to bring it back from the right
		setTimeout(function () {
			stopInteraction();
			this.targetLength.textContent = length + " letters";
			appendLetterDivs(1, this.word);
			const letterDivs = this.word.querySelectorAll(".letter");
			letterDivs.forEach((letterDiv) => {
				letterDiv.textContent = "";
				// letterDiv.style.borderColor = targetLength_colors[length];
			});
			this.level.classList.remove("fade-out-left");
			this.level.classList.add("teleport");
		}, 1500); // Adjust the delay to match your transition duration

		setTimeout(function () {
			this.level.classList.remove("teleport");
			// this.level.classList.add("fade-in-right");
		}, 1600); // Adjust the delay to match your transition duration

		setTimeout(function () {
			// this.level.classList.remove("fade-in-right");
			startInteraction();
		}, 2100); // Adjust the delay to match your transition duration
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
