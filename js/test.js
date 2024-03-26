const DEBUG = {
	forceNewGame: true,
};

//Returns null if gameData doesn't exist
function clearCurrentGameData() {
	const gameID = getGameID();
	localStorage.removeItem(gameID);
}
