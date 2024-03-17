//Returns null if gameData doesn't exist
function loadGameState() {
	const gameID = getGameID();
	if (!localStorage.getItem(gameID)) {
		return null;
	}
	return JSON.parse(localStorage.getItem(gameID));
}

function saveGameState(gameState) {
	const gameID = getGameID();
	localStorage.setItem(
		gameID,
		JSON.stringify({
			trigram: gameState.trigram,
			wordsProvided: gameState.lettersProvided,
		})
	);
}

function getGameID() {
	const startDate = new Date(2024, 2, 16);
	const msOffset = Date.now() - startDate;
	const dayOffset = msOffset / 1000 / 60 / 60 / 24;
	// return Math.floor(dayOffset);
	return 0;
}

function getGameIDString() {
	var numStr = (getGameID() + 1).toString();
	numStr = numStr.length > 3 ? numStr : numStr.padStart(3, "0");
	return numStr;
}
