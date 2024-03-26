const DEBUG = {
	forceNewGame: false,
	forceFakePastStats: false,
};

const fakeCurrentGameID = 8;
const fakePastGameData = [
	{
		gameID: 0,
		trigram: "CAT",
		wordsProvided: [
			null,
			null,
			null,
			null,
			"CATS",
			"CATER",
			"CATERS",
			"CATERED",
			"CATERING",
			"DELICATES",
			"CATEGORIES",
			"CATEGORIZES",
			"CATEGORIZING",
		],
	},
	{
		gameID: 1,
		trigram: "CAT",
		wordsProvided: [
			null,
			null,
			null,
			null,
			"CATS",
			"CATER",
			"CATERS",
			"CATERED",
			"CATERING",
			"DELICATES",
		],
	},
	{
		gameID: 3,
		trigram: "CAT",
		wordsProvided: [
			null,
			null,
			null,
			null,
			"CATS",
			"CATER",
			"CATERS",
			"CATERED",
			"CATERING",
			"DELICATES",
			"CATEGORIES",
			"CATEGORIZES",
			"CATEGORIZING",
			"AUTHENTICATES",
		],
	},
	{
		gameID: 4,
		trigram: "CAT",
		wordsProvided: [
			null,
			null,
			null,
			null,
			"CATS",
			"CATER",
			"CATERS",
			"CATERED",
			"CATERING",
			"DELICATES",
			"CATEGORIES",
			"CATEGORIZES",
			"CATEGORIZING",
			"AUTHENTICATES",
		],
	},
	{
		gameID: 6,
		trigram: "CAT",
		wordsProvided: [
			null,
			null,
			null,
			null,
			"CATS",
			"CATER",
			"CATERS",
			"CATERED",
			"CATERING",
		],
	},
	{
		gameID: 7,
		trigram: "CAT",
		wordsProvided: [
			null,
			null,
			null,
			null,
			"CATS",
			"CATER",
			"CATERS",
			"CATERED",
			"CATERING",
			"DELICATES",
			"CATEGORIES",
			"CATEGORIZES",
			"CATEGORIZING",
			"AUTHENTICATES",
			"AUTHENTICATING",
		],
	},
];

function clearCurrentGameData() {
	const gameID = getGameID();
	localStorage.removeItem(gameID);
}

function setFakePastGameData() {
	//clear local storage (except for curr game if DEBUG.forceNewGame==false)
	if (DEBUG.forceNewGame) {
		localStorage.clear();
	} else {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key !== getGameID()) {
				console.log("REMOVING", key);
				localStorage.removeItem(key);
			}
		}
	}
	//

	//populate local storage with fake data
	fakePastGameData.forEach((game) => {
		localStorage.setItem(
			game.gameID,
			JSON.stringify({
				trigram: game.trigram,
				wordsProvided: game.wordsProvided,
			})
		);
	});
}
