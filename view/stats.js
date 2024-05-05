// UP NEXT:
// -

///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*        STATS UI                      */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
// 3 Stats elements:
// (1) Word List ("Your Words")
// (2) Counting Stats ("Your Stats")
// (3) Histogram ("Longest Word Distribution")
//
const STATS = {};
//Stats used for (2) Counting Stats
STATS.numGamesPlayed = 0;
STATS.numGamesWon = 0;
STATS.currentStreak = 0;
STATS.maxStreak = 0;
STATS.longestWordLength = 0;
//Stats used for (3) Histogram
STATS.longestWordCounts = {};

function initializeStatsUI(trigram, wordsProvided = null) {
	//Load stats from past games and current game (if it exists)
	loadStats();

	//Initialize the 3 Stats components
	setWordListUI(trigram, wordsProvided);
	setCountingStatsUI();
	setHistogramUI();
}

function updateStatsUI(latestWord) {
	//(1) Word List
	//    Update Word List component to include latest word
	addToWordListUI(latestWord);

	//(2) Counting Stats
	//    Increment Counting Stats if this is the start of the current game
	if (latestWord.length == wordLength_start) {
		STATS.numGamesPlayed++;
		STATS.currentStreak++;
		STATS.maxStreak = Math.max(STATS.maxStreak, STATS.currentStreak);
	}
	if (latestWord.length == 12) {
		STATS.numGamesWon++;
	}
	STATS.longestWordLength = Math.max(
		STATS.longestWordLength,
		latestWord.length
	);
	setCountingStatsUI();

	//(3) Histogram
	//    Update histogram, using the latest word as this game's longest word
	//Case i) the first word of the game
	if (latestWord.length == wordLength_start) {
		STATS.longestWordCounts[wordLength_start] =
			(STATS.longestWordCounts[wordLength_start] || 0) + 1;
	}
	//Case ii) not the first word of the game
	else {
		//Decrement count of game's previous longest word length
		STATS.longestWordCounts[latestWord.length - 1]--;
		if (STATS.longestWordCounts[latestWord.length - 1] == 0) {
			delete STATS.longestWordCounts[latestWord.length - 1];
		}
		//Increment count of game's current longest word length
		STATS.longestWordCounts[latestWord.length] =
			(STATS.longestWordCounts[latestWord.length] || 0) + 1;
	}
	setHistogramUI();
}

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*          WORD LIST                         */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
const wordListDiv = document.getElementById("wordListValue");

function setWordListUI(trigram, wordsProvided) {
	// Case 1: No valid words submitted yet
	if (!wordsProvided || wordsProvided.length == 0) {
		const emptyStateTrigram = document.getElementById(
			"stat-wordList-emptyState-trigram"
		);
		emptyStateTrigram.textContent = trigram;
	}
	// Case 2: Valid word(s) have been submitted
	else {
		wordsProvided.forEach((word) => {
			addToWordListUI(word);
		});
	}
}

function addToWordListUI(word) {
	//Remove empty state UI if it is shown
	var emptyState = wordListDiv.querySelector("p#wordListEmptyState");
	if (emptyState != null) {
		emptyState.remove();
	}

	const length = word.length;

	const levelDiv = document.createElement("div");
	levelDiv.classList.add("stat-wordList-level");
	levelDiv.id = "stat-wordList-level" + length;

	const lengthDiv = document.createElement("div");
	lengthDiv.classList.add("stat-wordList-length");
	lengthDiv.id = "stat-wordList-length" + length;
	lengthDiv.textContent = length + ":";
	levelDiv.appendChild(lengthDiv);

	const wordDiv = document.createElement("div");
	wordDiv.classList.add("stat-wordList-word");
	wordDiv.id = "stat-wordList-word" + length;
	wordDiv.innerHTML = word.replace(
		GAME_STATE.trigram,
		`<span class="stat-wordList-trigram">${GAME_STATE.trigram}</span>`
	);
	levelDiv.appendChild(wordDiv);

	wordListDiv.appendChild(levelDiv);
}
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*          COUNTING STATS                    */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
const statListDiv = document.getElementById("statListValue");

function setCountingStatsUI() {
	//Games Played div
	const numGamesPlayedDiv = document.getElementById("stat-numGamesPlayed");
	numGamesPlayedDiv.textContent = STATS.numGamesPlayed;

	//Win % div
	const winPercentageDiv = document.getElementById("stat-winPercentage");
	winPercentageDiv.textContent = calcWinPercentage();

	//Current Streak div
	const currStreakDiv = document.getElementById("stat-currentStreak");
	currStreakDiv.textContent = STATS.currentStreak;

	//Max Streak div
	const maxStreakDiv = document.getElementById("stat-maxStreak");
	maxStreakDiv.textContent = STATS.maxStreak;

	//Longest Word div - DEPRECATED
	// const longestWordDiv = document.getElementById("stat-longestWordLength");
	// longestWordDiv.textContent =
	// 	STATS.longestWordLength == 0 ? "n/a" : STATS.longestWordLength;
}

function calcWinPercentage() {
	if (STATS.numGamesPlayed == 0) {
		return "n/a";
	}
	const winPct = 100 * (STATS.numGamesWon / STATS.numGamesPlayed);
	if (winPct === 100) {
		return 100;
	}
	// If winPct is less than 10, return with 2 decimal places
	if (winPct < 10) {
		return parseFloat(winPct.toFixed(2));
	}
	// If winPct is two-digit, return with 1 decimal place
	return parseFloat(winPct.toFixed(1));
}

//Defaults to 0
function calcNumGamesWon(pastGames) {
	var numGamesWon = 0;
	for (let index = 0; index < pastGames.length; index++) {
		const game = pastGames[index];
		if (game.longestWord >= 12) {
			numGamesWon++;
		}
	}
	return numGamesWon;
}

//Defaults to 0
function calcCurrentStreak(pastGames) {
	var currGameNum = getGameID();
	var streakCount = 0;
	for (let index = 0; index < pastGames.length; index++) {
		const game = pastGames[pastGames.length - 1 - index];
		if (game.gameID >= currGameNum - 1) {
			streakCount++;
			currGameNum = game.gameID;
		} else {
			break;
		}
	}
	return streakCount;
}

//Defaults to 0
function calcMaxStreak(pastGames) {
	var currGameNum = -100;
	var streakCount = 0;
	var maxStreak = 0;
	for (let index = 0; index < pastGames.length; index++) {
		const gameID = pastGames[index].gameID;
		if (gameID == currGameNum + 1) {
			streakCount++;
			currGameNum = gameID;
		} else {
			maxStreak = Math.max(maxStreak, streakCount);
			streakCount = 1;
			currGameNum = gameID;
		}
	}
	maxStreak = Math.max(maxStreak, streakCount);
	return maxStreak;
}

//Defaults to 0
function calcLongestWord(pastGames) {
	var currLongest = 0;
	for (let index = 0; index < pastGames.length; index++) {
		const game = pastGames[index];
		// if (game.longestWord == GAME_STATE.wordLength_max) {
		// 	return GAME_STATE.wordLength_max;
		// }
		if (game.longestWord > currLongest) {
			currLongest = game.longestWord;
		}
	}
	return currLongest;
}

///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*           HISTOGRAM                        */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
const statDistributionDiv = document.getElementById("statDistributionValue");

function setHistogramUI() {
	// Case 1: No data (show empty state)
	if (Object.keys(STATS.longestWordCounts).length == 0) {
		const emptyState = document.createElement("p");
		emptyState.textContent =
			"A graph of your longest words from each game will appear here.";
		statDistributionDiv.appendChild(emptyState);
		return;
	}

	// Case 2: Data available (populate histogram)
	const histogram_minWidth = 2;
	const histogram_maxWidth = 15;
	var minLongestWord = 1000;
	var maxLongestWord = 0;
	var maxWordCount = -10;

	for (const wordLength in STATS.longestWordCounts) {
		minLongestWord = Math.min(minLongestWord, wordLength);
		maxLongestWord = Math.max(maxLongestWord, wordLength);
		maxWordCount = Math.max(
			maxWordCount,
			STATS.longestWordCounts[wordLength]
		);
	}
	statDistributionDiv.innerHTML = "";
	for (let index = minLongestWord; index <= maxLongestWord; index++) {
		const row = document.createElement("div");
		row.classList.add("stat-statDistribution-item");

		const length = document.createElement("div");
		length.classList.add("stat-statDistribution-itemLength");
		length.textContent = index + ":";
		row.appendChild(length);

		const count = document.createElement("div");
		count.classList.add("stat-statDistribution-itemCount");
		count.textContent = STATS.longestWordCounts[index] || 0;
		count.style.width = `${
			histogram_minWidth +
			histogram_maxWidth * (STATS.longestWordCounts[index] / maxWordCount)
		}ch`;
		row.appendChild(count);

		statDistributionDiv.appendChild(row);
	}
}
///////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////
// HELPER FUNCTIONS --------------------------------//
//////////////////////////////////////////////////////

function loadStats() {
	pastGames = []; //excludes current game
	const keys = Object.keys(localStorage)
		.filter((key) => /^\d+$/.test(key)) // filter keys that are not integers
		.map((key) => parseInt(key, 10)) //convert keys from strings to ints
		.sort((a, b) => a - b); //sort ints in ascending order
	for (const key of keys) {
		const value = JSON.parse(localStorage.getItem(key));
		pastGames.push({
			gameID: key,
			trigram: value.trigram,
			longestWord:
				value.wordsProvided[value.wordsProvided.length - 1].length,
		});
	}
	//Calculate stats
	STATS.numGamesPlayed = pastGames.length;
	STATS.numGamesWon = calcNumGamesWon(pastGames);
	STATS.currentStreak = calcCurrentStreak(pastGames);
	STATS.maxStreak = calcMaxStreak(pastGames);
	STATS.longestWordLength = calcLongestWord(pastGames);
	for (let index = 0; index < pastGames.length; index++) {
		const currLongestWord = pastGames[index].longestWord;
		STATS.longestWordCounts[currLongestWord] =
			(STATS.longestWordCounts[currLongestWord] || 0) + 1;
	}
}

function showNextGameCountdownUI() {
	const countdownText = document.getElementById("nextGameCountdown");
	countdownText.textContent =
		"*" + countdownText.textContent + " " + getNextMondayString() + "*";

	const countdownDiv = document.getElementById("nextGameCountdownDiv");
	countdownDiv.style.display = "block";
}
