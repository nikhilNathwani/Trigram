//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*       LOCAL STORAGE I/O              */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//

//Returns null if gameData doesn't exist
function loadGameState() {
	const gameID = getGameID();
	//Case 1: New Game
	if (!localStorage.getItem(gameID)) {
		return null;
	}
	//Case 2: Resume Game
	return JSON.parse(localStorage.getItem(gameID));
}

function saveGameState(gameState) {
	//Save latest state to local storage
	const gameID = getGameID();
	localStorage.setItem(
		gameID,
		JSON.stringify({
			trigram: gameState.trigram,
			wordsProvided: gameState.lettersProvided,
		})
	);
}
