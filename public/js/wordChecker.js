//
export function loadWordList(trigram) {
	return fetch(
		"data/trigram-word-lists/" + trigram.toLowerCase() + "_words.json"
	)
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error loading word list:", error);
			throw error;
		});
}

// Returns [isValid, errorCode] where:
//    -isValid is true/false indicating whether the inputted word meets the constraints
//    -errorCode is a string code identifying which validation failed
//     (mapped to a display string by lookupErrorString in public/js/ui/view.js,
//      via the "guess:invalid" event)
export function validateWord(word, trigram, currWordLength, wordList) {
	if (!isWordLengthReached(word, currWordLength)) {
		return [false, "WRONG-LENGTH"];
	} else if (!containsTrigram(word, trigram)) {
		return [false, "TRIGRAM-MISSING"];
	} else if (!existsInWordList(word, currWordLength, wordList)) {
		return [false, "NOT-FOUND"];
	} else {
		return [true, ""];
	}
}

export function isWordLengthReached(word, currWordLength) {
	return currWordLength == word.length;
}

export function containsTrigram(word, trigram) {
	return word.includes(trigram);
}

export function existsInWordList(word, currWordLength, wordList) {
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
