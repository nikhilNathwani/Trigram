let wordList = null;
loadWordList();

function loadWordList() {
	return new Promise((resolve, reject) => {
		fetch("data/cat_words.json")
			.then((response) => response.json())
			.then((data) => {
				wordList = data;
				resolve();
			})
			.catch((error) => {
				console.error("Error loading word list:", error);
				reject(error);
			});
	});
}

// Returns [isValid, errorReason] where:
//    -isValid is true/false indicating whether the inputted word meets the constraints
//    -errorReason is a string indicating which error message to display
function validateWord(word) {
	if (!isTargetLengthReached(word)) {
		return [false, lookupErrorString("WRONG-LENGTH")];
	} else if (!containsTrigram(word)) {
		return [false, lookupErrorString("TRIGRAM-MISSING")];
	} else if (!existsInWordList(word)) {
		return [false, lookupErrorString("NOT-FOUND")];
	} else {
		return [true, ""];
	}
}

function isTargetLengthReached(word) {
	return GAME_STATE.wordLength_current == word.length;
}

function containsTrigram(word) {
	return word.includes(GAME_STATE.trigram);
}

function existsInWordList(word) {
	console.log(
		"Checking word existence",
		word,
		wordList[GAME_STATE.wordLength_current.toString()]
	);
	if (!wordList) {
		console.error("Word list not loaded.");
		return false;
	}
	const words = wordList[GAME_STATE.wordLength_current.toString()];
	if (words && Array.isArray(words)) {
		return words.includes(word.toLowerCase());
	}

	return false;
}

function isLongestPossibleWord(word) {
	return false;
}

function lookupErrorString(errorCode) {
	console.log("Error reason:", errorCode);
	switch (errorCode) {
		case "WRONG-LENGTH":
			return `Word not ${GAME_STATE.wordLength_current} letters long`;
		case "TRIGRAM-MISSING":
			return `Doesn't contain ${GAME_STATE.trigram}`;
		case "NOT-FOUND":
			return "Not in word list";
		default:
			return "An unknown error occurred.";
	}
}

// Usage:
// loadWordList().then(() => {
// 	const word = "catch";
// 	const exists = existsInWordList(word);
// 	console.log(exists); // true or false
// });
