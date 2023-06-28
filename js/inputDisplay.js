const gameDisplayArea = document.querySelector("#gameDisplayArea");

// Functions
// Create level
// Style level
//

function drawAllLevels(firstLevel, lastLevel) {
	for (let i = firstLevel; i <= lastLevel; i++) {
		var levelDiv = createLevelElement(i, inputStateEnum.INACTIVE);
		gameDisplayArea.append(levelDiv);
	}
}

function createLevelElement(levelNumber, initialState) {
	// Create the outer level div
	var levelDiv = document.createElement("div");
	levelDiv.classList.add("level");
	levelDiv.classList.add(initialState);
	levelDiv.id = "level_" + levelNumber;

	// Create the target length div
	var targetLengthDiv = document.createElement("div");
	targetLengthDiv.classList.add("targetLength");
	targetLengthDiv.classList.add(initialState);
	targetLengthDiv.id = "targetLength_" + levelNumber;
	targetLengthDiv.textContent = levelNumber.toString();
	levelDiv.appendChild(targetLengthDiv);

	// Create the input wrapper div
	var inputWrapperDiv = document.createElement("div");
	inputWrapperDiv.classList.add("inputWrapper");
	inputWrapperDiv.classList.add(initialState);
	inputWrapperDiv.id = "inputWrapper_" + levelNumber;
	levelDiv.appendChild(inputWrapperDiv);

	// Create the input field
	var inputField = document.createElement("input");
	inputField.type = "text";
	inputField.name = "wordInput";
	inputField.maxLength = levelNumber;
	inputField.classList.add("inputField");
	inputField.classList.add(initialState);
	inputField.id = "inputField_" + levelNumber;
	inputField.style.width = `calc((${levelNumber} * (1ch + ${letterGap})))`;
	inputWrapperDiv.appendChild(inputField);

	// Return the generated HTML element
	return levelDiv;
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
