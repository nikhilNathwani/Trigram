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
			return "Word not found.";
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

function existsInWordList(word) {
	return true; //will complete this function later
}

function isLongestPossibleWord(word) {
	return false;
}
