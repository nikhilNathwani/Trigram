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

// Returns array of objects representing past games (excludes current game)
// Past games represented by objects containing gameID, trigram, and wordsProvided array
function loadPastGames() {
	pastGames = []; //excludes current game
	const keys = Object.keys(localStorage)
		.filter((key) => /^\d+$/.test(key)) // filter keys that are not integers
		.map((key) => parseInt(key, 10)) //convert keys from strings to ints
		.sort((a, b) => a - b); //sort ints in ascending order
	for (const key of keys) {
		const value = JSON.parse(localStorage.getItem(key));
		if (
			value &&
			value.trigram &&
			value.wordsProvided &&
			Array.isArray(value.wordsProvided)
		) {
			pastGames.push({
				gameID: key,
				trigram: value.trigram,
				longestWord:
					value.wordsProvided[value.wordsProvided.length - 1].length,
			});
		}
	}
	return pastGames;
}
