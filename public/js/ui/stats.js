import { getGameID, getNextMondayString } from "../calendar.js";
import { loadPastGames, loadCurrentGame } from "../storage.js";
import { trigram, gameEvents } from "../game.js";

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
//Stats used for (2) Counting Stats
let numGamesPlayed = 0;
let currentStreak = 0;
let maxStreak = 0;
let longestWordLength = 0;
// Win % specifically only counts settled (past) weeks, tracked separately
// from numGamesPlayed above — see the comment on these in loadStats().
let numPastGamesPlayed = 0;
let numPastGamesWon = 0;
//Stats used for (3) Histogram
let longestWordCounts = {};

export function initializeStatsUI(trigram, wordsProvided = null) {
	//Load stats from past games and current game (if it exists)
	loadStats();

	//Initialize the 3 Stats components
	setWordListUI(trigram, wordsProvided);
	setCountingStatsUI();
	setHistogramUI();
}

// GAME EVENT SUBSCRIPTIONS ------------------------------------------------ //
// game.js narrates what happened; it has no idea stats.js is listening.
// ui/view.js subscribes to the same events independently — see its own
// "GAME EVENT SUBSCRIPTIONS" section. Don't assume ordering between the two.
gameEvents.addEventListener("game:started", (e) =>
	initializeStatsUI(e.detail.trigram, e.detail.wordsProvided)
);
gameEvents.addEventListener("guess:valid", (e) => updateStatsUI(e.detail.word));
gameEvents.addEventListener("game:ended", () => showNextGameCountdownUI());

export function updateStatsUI(latestWord) {
	//(1) Word List
	//    Update Word List component to include latest word
	addToWordListUI(latestWord);

	//(2) Counting Stats + (3) Histogram
	//    The current game counts toward stats as soon as its first level is
	//    complete (see loadStats()/loadCurrentGame()), and its contribution
	//    keeps moving to a longer word as the game progresses — recomputing
	//    from scratch after every valid guess keeps both in sync with that,
	//    and is what keeps this correct across a reload too (loadStats()
	//    is the same function initializeStatsUI() calls on page load).
	loadStats();
	setCountingStatsUI();
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
		trigram,
		`<span class="stat-wordList-trigram">${trigram}</span>`
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
	numGamesPlayedDiv.textContent = numGamesPlayed;

	//Win % div
	const winPercentageDiv = document.getElementById("stat-winPercentage");
	winPercentageDiv.textContent = calcWinPercentage();

	//Current Streak div
	const currStreakDiv = document.getElementById("stat-currentStreak");
	currStreakDiv.textContent = currentStreak;

	//Max Streak div
	const maxStreakDiv = document.getElementById("stat-maxStreak");
	maxStreakDiv.textContent = maxStreak;

	//Longest Word div - DEPRECATED
	// const longestWordDiv = document.getElementById("stat-longestWordLength");
	// longestWordDiv.textContent =
	// 	longestWordLength == 0 ? "n/a" : longestWordLength;
}

export function calcWinPercentage() {
	if (numPastGamesPlayed == 0) {
		return "n/a";
	}
	const winPct = 100 * (numPastGamesWon / numPastGamesPlayed);
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
export function calcNumGamesWon(pastGames) {
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
export function calcCurrentStreak(pastGames) {
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
export function calcMaxStreak(pastGames) {
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
export function calcLongestWord(pastGames) {
	var currLongest = 0;
	for (let index = 0; index < pastGames.length; index++) {
		const game = pastGames[index];
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
	if (Object.keys(longestWordCounts).length == 0) {
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

	for (const wordLength in longestWordCounts) {
		minLongestWord = Math.min(minLongestWord, wordLength);
		maxLongestWord = Math.max(maxLongestWord, wordLength);
		maxWordCount = Math.max(maxWordCount, longestWordCounts[wordLength]);
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
		count.textContent = longestWordCounts[index] || 0;
		count.style.width = `${
			histogram_minWidth +
			histogram_maxWidth * (longestWordCounts[index] / maxWordCount)
		}ch`;
		row.appendChild(count);

		statDistributionDiv.appendChild(row);
	}
}
///////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////
// HELPER FUNCTIONS --------------------------------//
//////////////////////////////////////////////////////

export function loadStats() {
	// The current game counts alongside past games as soon as it has a
	// longestWord (i.e. at least one level completed) — loadCurrentGame()
	// returns null until then, so an untouched current game is correctly
	// left out. calcCurrentStreak/calcMaxStreak are pure functions over
	// {gameID, longestWord} entries and don't need to know which of these
	// is "current" vs "past": the current game's gameID is always the
	// highest (today), so appending it last preserves the ascending sort
	// those calc functions assume.
	const pastGames = loadPastGames();
	const currentGame = loadCurrentGame();
	const games = currentGame ? [...pastGames, currentGame] : pastGames;

	//Calculate "Played"/streaks/histogram — these reflect the current week
	//live, same as a finished past week.
	numGamesPlayed = games.length;
	currentStreak = calcCurrentStreak(games);
	maxStreak = calcMaxStreak(games);
	longestWordLength = calcLongestWord(games);
	longestWordCounts = {};
	for (let index = 0; index < games.length; index++) {
		const currLongestWord = games[index].longestWord;
		longestWordCounts[currLongestWord] =
			(longestWordCounts[currLongestWord] || 0) + 1;
	}

	// Win % specifically only counts settled (past) weeks, computed from
	// pastGames rather than games — this week's win/loss status isn't
	// knowable until it's over (there's no "loss" event in this game, only
	// a deadline: see game.js, which never fails a guess into a terminal
	// state), so folding it in here would show a misleading dip, or a
	// premature 0%, for a week that's still fully winnable.
	numPastGamesPlayed = pastGames.length;
	numPastGamesWon = calcNumGamesWon(pastGames);
}

export function showNextGameCountdownUI() {
	const countdownText = document.getElementById("nextGameCountdown");
	countdownText.textContent =
		"*" + countdownText.textContent + " " + getNextMondayString() + "*";

	const countdownDiv = document.getElementById("nextGameCountdownDiv");
	countdownDiv.style.display = "block";
}
