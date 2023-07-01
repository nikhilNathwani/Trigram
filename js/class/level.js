const LevelState = {
	INACTIVE: "inactive",
	ACTIVE: "active",
	COMPLETE: "complete",
};

class Level {
	constructor(wordLength) {
		this.state = LevelState.INACTIVE;
		this.wordLength = wordLength;
		this.acceptedWord = "";
		this.levelDiv = this.createLevelDiv(wordLength, this.state);
	}

	// Getter methods
	getState() {
		return this.state;
	}

	getWordLength() {
		return this.wordLength;
	}

	getAcceptedWord() {
		return this.acceptedWord;
	}

	// Setter methods
	setState(state) {
		if (this.state == LevelState.COMPLETE) {
			return; //Once complete, state doesn't change
		}
		if (!Object.values(LevelState).includes(state)) {
			throw new Error("Invalid state value");
		}
		this.state = state;
		updateStateClasses(this.levelDiv, state);
		if (state == LevelState.ACTIVE) {
			this.levelDiv.querySelector("input").focus();
		}
	}

	setAcceptedWord(word) {
		this.acceptedWord = word;
	}

	createLevelDiv(levelNumber, initialState) {
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
}

//Updates the state class of given element and all descendents
function updateStateClasses(element, newState) {
	clearStateClasses(element);
	element.classList.add(newState);
	var children = element.children;
	for (var i = 0; i < children.length; i++) {
		updateStateClasses(children[i], newState);
	}
}

function clearStateClasses(element) {
	element.classList.remove(LevelState.INACTIVE);
	element.classList.remove(LevelState.ACTIVE);
	element.classList.remove(LevelState.COMPLETE);
}
