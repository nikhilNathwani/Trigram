const gameDisplayArea = document.querySelector("#gameDisplayArea");

// Functions
// Create level
// Style level
//

function drawAllLevels() {
	for (let i = 0; i < levels.length; i++) {
		game.gameDiv.append(levels[i].createLevelDiv());
	}
}

function updateLevelDisplay(levelNumber, state) {
	switch (state) {
		case inputStateEnum["INACTIVE"]:
			setInactiveDisplayState(levelNumber);
		case inputStateEnum["ACTIVE"]:
			setActiveDisplayState(levelNumber);
		case inputStateEnum["COMPLETED"]:
			setCompletedDisplayState(levelNumber);
		default:
			break;
	}
	return;
}
