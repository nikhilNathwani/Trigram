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
		// Check if the state value is valid
		if (Object.values(LevelState).includes(state)) {
			this.state = state;
		} else {
			throw new Error("Invalid state value");
		}
	}

	setAcceptedWord(word) {
		this.acceptedWord = word;
	}
}

// Export the Level class
export default Level;
