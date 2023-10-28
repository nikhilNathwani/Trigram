function getErrorReason() {
	var word = GAME_STATE.lettersProvided[GAME_STATE.wordLength_current];
	var errorReason =
		word.length != GAME_STATE.wordLength_current
			? `Word not ${GAME_STATE.wordLength_current} letters long`
			: !word.includes(GAME_STATE.trigram)
			? `Doesn't contain ${GAME_STATE.trigram}`
			: !wordListContains(word)
			? "Not in word list"
			: "Unknown error";
	console.log("Error reason:", errorReason);
	return errorReason;
}

function wordListContains(word) {
	return true;
}
