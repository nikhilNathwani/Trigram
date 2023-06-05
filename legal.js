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

function lookupErrorString(errorCode) {
	switch (errorCode) {
		case "WRONG-LENGTH":
			return `Word must be ${targetLength} letters long.`;
		case "TRIGRAM-MISSING":
			return `Word must contain ${trigram}.`;
		case "NOT-FOUND":
			return "Not in word list";
		default:
			return "An error occurred.";
	}
}

function isTargetLengthReached(word) {
	return targetLength == word.length;
}

function containsTrigram(word) {
	return word.includes(trigram);
}

let wordList = null;

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

function existsInWordList(word) {
	if (!wordList) {
		console.error("Word list not loaded.");
		return false;
	}
	const words = wordList[targetLength.toString()];
	if (words && Array.isArray(words)) {
		return words.includes(word.toLowerCase());
	}

	return false;
}

// Usage:
loadWordList().then(() => {
	const word = "catch";
	const exists = existsInWordList(word);
	console.log(exists); // true or false
});

function isLongestPossibleWord(word) {
	return false;
}
