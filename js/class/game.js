class Game {
	constructor(trigram, minTargetLength, maxTargetLength) {
		this.gameDiv = document.querySelector("#gameDisplayArea");
		this.trigram = trigram;
		this.minTargetLength = minTargetLength;
		this.maxTargetLength = maxTargetLength;
		//allLevels is an array where index N is for level with wordLength N
		//i.e. indices 0 through minTargetLength-1 will be null.
		this.allLevels = this.generateAllLevels();
		this.currentLevel = this.getLevel(minTargetLength);
	}

	generateAllLevels() {
		var minLen = this.minTargetLength;
		var maxLen = this.maxTargetLength;
		const allLevels = Array(maxLen + 1).fill(null);
		for (let i = minLen; i <= maxLen; i++) {
			allLevels[i] = new Level(i);
			this.gameDiv.append(allLevels[i].levelDiv);
		}
		return allLevels;
	}

	getLevel(wordLength) {
		return this.allLevels[wordLength] || null;
	}

	acceptWord(word) {
		this.currentLevel.acceptedWord = word;
		this.currentLevel.setState(LevelState.COMPLETE);
		advanceLevel();
	}

	// ~~~~~~~~~~  HELPERS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	isGameComplete() {
		for (let i = this.minTargetLength; i <= this.maxTargetLength; i++) {
			if (
				this.completedLevels[i] === null ||
				!(this.completedLevels[i] instanceof Level)
			) {
				return false;
			}
		}
		return true;
	}

	advanceLevel() {
		//Find next incomplete level
		this.currentLevel = null;
		for (let i = 0; i < this.allLevels.length; i++) {
			var index = (word.length + 1 + i) % this.allLevels.length;
			var level = allLevels[index]; //unnecessarily checks indices 0 through minTarget-1 which are all null
			if (level != null && level.state != LevelState.COMPLETE) {
				this.currentLevel = level;
			}
		}
		//Set new current level to ACTIVE (if game isn't over)
		if (this.currentLevel != null) {
			this.currentLevel.setState(LevelState.ACTIVE); //will throw error when game is complete
		} else {
			endGame();
		}
	}

	endGame() {
		return; //TBD
	}
}
