//
function loadWordList(trigram) {
	return new Promise((resolve, reject) => {
		fetch("data/" + trigram.toLowerCase() + "_words.json")
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
function validateWord(word, trigram, currWordLength) {
	if (!isWordLengthReached(word, currWordLength)) {
		return [false, lookupErrorString("WRONG-LENGTH")];
	} else if (!containsTrigram(word, trigram)) {
		return [false, lookupErrorString("TRIGRAM-MISSING")];
	} else if (!existsInWordList(word, currWordLength)) {
		return [false, lookupErrorString("NOT-FOUND")];
	} else {
		return [true, ""];
	}
}

function isWordLengthReached(word, currWordLength) {
	return currWordLength == word.length;
}

function containsTrigram(word, trigram) {
	return word.includes(GAME_STATE.trigram);
}

function existsInWordList(word, currWordLength) {
	if (!wordList) {
		console.error("Word list not loaded.");
		return false;
	}
	const words = wordList[currWordLength];
	if (words && Array.isArray(words)) {
		return words.includes(word);
	}

	return false;
}

function isLongestPossibleWord(word) {
	return false;
}

function lookupErrorString(errorCode) {
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
