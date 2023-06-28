import Level from "./level.js";

class Game {
	constructor(trigram, minTargetLength, maxTargetLength) {
		this.trigram = trigram;
		this.minTargetLength = minTargetLength;
		this.maxTargetLength = maxTargetLength;
		this.allLevels = this.generateAllLevels(
			minTargetLength,
			maxTargetLength
		);
		this.currentLevel = this.getLevel(minTargetLength);
		this.nextLevel = this.getLevel(minTargetLength + 1);
		this.completedLevels = {};
	}

	generateAllLevels(minTargetLength, maxTargetLength) {
		const allLevels = {};
		for (
			let targetLength = minTargetLength;
			targetLength <= maxTargetLength;
			targetLength++
		) {
			allLevels[targetLength] = new Level(targetLength);
		}
		return allLevels;
	}

	getLevel(wordLength) {
		return this.allLevels[wordLength] || null;
	}
}

// Export the Game class
export default Game;
