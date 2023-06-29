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
		this.nextLevel = this.getLevel(minTargetLength + 1);
		this.completedLevels = Array(maxTargetLength + 1).fill(null);
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

	advanceLevel(targetLength, word) {
		//Set current level to complete
		this.currentLevel.acceptedWord = word;
		this.currentLevel.setState(LevelState.COMPLETE);

		//Move to next level
		this.currentLevel = this.nextLevel;
		this.currentLevel.setState(LevelState.ACTIVE); //will throw error when game is complete

		//Set the next level
		this.nextLevel = null;
		var currentTarget = this.currentLevel.wordLength;
		for (let i = 0; i < this.allLevels.length; i++) {
			var index = (currentTarget + 1 + i) % this.allLevels.length;
			var level = allLevels[index]; //future perf: check index>=minTargetLength first, will save some null checks
			if (level == this.currentLevel) {
				return; // call end-game sequence here
			}
			if (level.state == LevelState.INACTIVE) {
				this.nextLevel = level;
			}
		}
	}

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
}
