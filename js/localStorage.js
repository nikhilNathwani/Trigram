// console.log(trigramIndex);

//Only use if !isGameStarted()
// function saveInitialGameState() {
// 	const initialGameData = {
// 		trigram: trigrams[trigramIndex],
// 		wordsProvided: new Array(GAME_STATE.wordLength_start).fill(null),
// 	};
// 	setGameData(initialGameData);
// }

// function saveUpdatedGameState(word) {
// 	const gameData = getGameData();
// 	gameData.wordsProvided.push(word);
// 	localStorage.setItem(trigramIndex, JSON.stringify(gameData));
// }

function loadGameState() {
	const gameData = getGameData();
	GAME_STATE.trigram = gameData.trigram;
	GAME_STATE.wordLength_current = gameData.wordsProvided.length;
	GAME_STATE.lettersProvided = gameData.wordsProvided;
}
