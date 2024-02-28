const trigram = "CAT";
const trigramNum = 10;
const maxLength = 15;
const words = [
	"",
	"",
	"",
	"",
	"CATS",
	"CATER",
	"CATERS",
	"SCATTER",
	"DELICATE",
	"DELICATES",
	"DELICATELY",
	"CATEGORIZES",
	"CATEGORIZING",
	"AUTHENTICATES",
	"AUTHENTICATING",
	"REAUTHENTICATES",
];

function getLongestWord() {
	var currLongest = -1;
	for (let index = 0; index < pastGames.length; index++) {
		const game = pastGames[index];
		if (game.longestWord == maxLength) {
			return maxLength;
		}
		if (game.longestWord > currLongest) {
			currLongest = game.longestWord;
		}
	}
	return currLongest;
}

function getCurrentStreak() {
	var currGameNum = trigramNum;
	var streakCount = 0;
	for (let index = 0; index < pastGames.length; index++) {
		const game = pastGames[pastGames.length - 1 - index];
		if (game.id == currGameNum - 1) {
			streakCount++;
			currGameNum = game.id;
		} else {
			break;
		}
	}
	return streakCount;
}

function getMaxStreak() {
	var currGameNum = -100;
	var streakCount = 0;
	var maxStreak = 0;
	for (let index = 0; index < pastGames.length; index++) {
		const game = pastGames[index];
		if (game.id == currGameNum + 1) {
			streakCount++;
			currGameNum = game.id;
		} else {
			maxStreak = Math.max(maxStreak, streakCount);
			streakCount = 1;
			currGameNum = game.id;
		}
	}
	maxStreak = Math.max(maxStreak, streakCount);
	return maxStreak;
}

const pastGames = [
	{
		trigram: "ART",
		trigramNumber: "#001",
		id: 1,
		roundsCompleted: 2,
		longestWord: 11,
	},
	{
		trigram: "BIR",
		trigramNumber: "#002",
		id: 2,
		roundsCompleted: 1,
		longestWord: 7,
	},
	{
		trigram: "DRI",
		trigramNumber: "#004",
		id: 3,
		roundsCompleted: 3,
		longestWord: 12,
	},
	{
		trigram: "ELL",
		trigramNumber: "#005",
		id: 5,
		roundsCompleted: 3,
		longestWord: 12,
	},
	{
		trigram: "FOR",
		trigramNumber: "#006",
		id: 6,
		roundsCompleted: 3,
		longestWord: 12,
	},
	{
		trigram: "GRI",
		trigramNumber: "#007",
		id: 7,
		roundsCompleted: 2,
		longestWord: 10,
	},
	{
		trigram: "HEL",
		trigramNumber: "#008",
		id: 9,
		roundsCompleted: 1,
		longestWord: 7,
	},
];

const wordListDiv = document.getElementById("wordListValue");
const statListDiv = document.getElementById("statListValue");
const statDistributionDiv = document.getElementById("statDistributionValue");
// const statDetailsDiv = document.getElementById("statDetailsValue");

makeWordList();
makeStatList();
makeLongestWordDistribution();

function makeWordList() {
	for (let index = 0; index < words.length; index++) {
		if (words[index] != "") {
			const target = document.createElement("div");
			target.classList.add("stat-wordList-target");
			target.id = "stat-wordList-target" + index;

			const length = document.createElement("div");
			length.classList.add("stat-wordList-length");
			length.id = "stat-wordList-length" + index;
			length.textContent = index + ":";
			target.appendChild(length);

			const word = document.createElement("div");
			word.classList.add("stat-wordList-word");
			word.id = "stat-wordList-word" + index;
			word.innerHTML = words[index].replace(
				trigram,
				`<span class="stat-wordList-trigram">${trigram}</span>`
			);
			words[index];
			target.appendChild(word);

			wordListDiv.appendChild(target);
		}
	}
}

function makeStatList() {
	//Games Played div
	const playedDiv = document.createElement("div");
	playedDiv.classList.add("stat-statList-item");

	const playedValue = document.createElement("div");
	playedValue.classList.add("stat-statList-itemValue");
	playedValue.textContent = pastGames.length;
	playedDiv.appendChild(playedValue);

	const playedTitle = document.createElement("div");
	playedTitle.classList.add("stat-statList-itemTitle");
	playedTitle.textContent = "Played";
	playedDiv.appendChild(playedTitle);

	statListDiv.appendChild(playedDiv);

	//Current Streak div
	const currStreakDiv = document.createElement("div");
	currStreakDiv.classList.add("stat-statList-item");

	const currStreakValue = document.createElement("div");
	currStreakValue.classList.add("stat-statList-itemValue");
	currStreakValue.textContent = getCurrentStreak();
	currStreakDiv.appendChild(currStreakValue);

	const currStreakTitle = document.createElement("div");
	currStreakTitle.classList.add("stat-statList-itemTitle");
	currStreakTitle.textContent = "Current Streak";
	currStreakDiv.appendChild(currStreakTitle);

	statListDiv.appendChild(currStreakDiv);

	//Max Streak div
	const maxStreakDiv = document.createElement("div");
	maxStreakDiv.classList.add("stat-statList-item");

	const maxStreakValue = document.createElement("div");
	maxStreakValue.classList.add("stat-statList-itemValue");
	maxStreakValue.textContent = getMaxStreak();
	maxStreakDiv.appendChild(maxStreakValue);

	const maxStreakTitle = document.createElement("div");
	maxStreakTitle.classList.add("stat-statList-itemTitle");
	maxStreakTitle.textContent = "Max Streak";
	maxStreakDiv.appendChild(maxStreakTitle);

	statListDiv.appendChild(maxStreakDiv);

	//Longest Word div
	const longestWordDiv = document.createElement("div");
	longestWordDiv.classList.add("stat-statList-item");

	const longestWordValue = document.createElement("div");
	longestWordValue.classList.add("stat-statList-itemValue");
	longestWordValue.textContent = getLongestWord();
	longestWordDiv.appendChild(longestWordValue);

	const longestWordTitle = document.createElement("div");
	longestWordTitle.classList.add("stat-statList-itemTitle");
	longestWordTitle.textContent = "Longest Word";
	longestWordDiv.appendChild(longestWordTitle);

	statListDiv.appendChild(longestWordDiv);
}

function makeLongestWordDistribution() {
	var minLongestWord = 1000;
	var maxLongestWord = 0;
	var longestWordCounts = Array.from({ length: maxLength + 1 }, () => 0);

	for (let index = 0; index < pastGames.length; index++) {
		const currLongestWord = pastGames[index].longestWord;
		minLongestWord = Math.min(minLongestWord, currLongestWord);
		maxLongestWord = Math.max(maxLongestWord, currLongestWord);
		longestWordCounts[currLongestWord]++;
	}
	for (let index = minLongestWord; index <= maxLongestWord; index++) {
		const row = document.createElement("div");
		row.classList.add("stat-statDistribution-item");

		const length = document.createElement("div");
		length.classList.add("stat-statDistribution-itemLength");
		length.textContent = index + ":";
		row.appendChild(length);

		const count = document.createElement("div");
		count.classList.add("stat-statDistribution-itemCount");
		count.textContent = longestWordCounts[index];
		row.appendChild(count);

		statDistributionDiv.appendChild(row);
	}
}
