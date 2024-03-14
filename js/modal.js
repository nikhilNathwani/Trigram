//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*          TITLE SCREEN          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
setTitleScreenDate();

document.getElementById("playButton").addEventListener("click", function () {
	hideTitleScreen();
	showHelpScreen();
});
document.getElementById("howToButton").addEventListener("click", function () {
	hideTitleScreen();
	showHelpScreen();
});

function hideTitleScreen() {
	hideScreen("title");
}
///////////////////////////////////////////////////

//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*     TRIGRAM REVEAL OVERLAY     */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
var trigramRevealShown = false;

function showTrigramRevealScreen() {
	//show screen then fade out after 4 seconds
	showScreen("trigramReveal");
	setTimeout(() => {
		const screen = document.getElementById("trigramRevealScreen");
		screen.classList.add("fade-out");
		screen.addEventListener("transitionend", () => {
			hideTrigramRevealScreen();
		});
		trigramRevealShown = true;
	}, 4000);
}

function hideTrigramRevealScreen() {
	hideScreen("trigramReveal");
}
///////////////////////////////////////////////////

//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*           HELP SCREEN          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
const helpScreen = document.getElementById("helpScreen");

// Help button in game header
document.getElementById("helpButton").addEventListener("click", function () {
	showHelpScreen();
});

//Close (X) button in Help dialog
helpScreen.querySelector(".closeButton").addEventListener("click", function () {
	hideHelpScreen();
});

//Clicking outside Help dialog closes it
helpScreen.addEventListener("click", function (event) {
	if (event.target === helpScreen) {
		hideHelpScreen();
	}
});

//Show/Hide functions for Help screen
function showHelpScreen() {
	showScreen("help");
}
function hideHelpScreen() {
	hideScreen("help");
	if (!trigramRevealShown) {
		showTrigramRevealScreen();
	}
}
///////////////////////////////////////////////////

//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*          STATS SCREEN          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
const statsScreen = document.getElementById("statsScreen");

// Stats button in game header
document.getElementById("statsButton").addEventListener("click", function () {
	showStatsScreen();
});

//Close (X) button in Stats screen
statsScreen
	.querySelector(".closeButton")
	.addEventListener("click", function () {
		hideStatsScreen();
	});

//Clicking outside Stats dialog closes it
statsScreen.addEventListener("click", function (event) {
	if (event.target === statsScreen) {
		hideStatsScreen();
	}
});

//Show/Hide functions for Stats screen
function showStatsScreen() {
	showScreen("stats");
}
function hideStatsScreen() {
	hideScreen("stats");
}
///////////////////////////////////////////////////

//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*     YOU WIN OVERLAY     */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//

//View Stats button in You Win overlay
document
	.getElementById("viewStatsButton")
	.addEventListener("click", function () {
		showStatsScreen();
	});

//Bonus Round button in You Win overlay
document
	.getElementById("bonusRoundButton")
	.addEventListener("click", function () {
		UI_STATE.startBonusGame();
	});

function showYouWinScreen() {
	showScreen("youWin");
	setTimeout(() => {
		const screen = document.getElementById("youWinScreen");
		screen.classList.add("fade-in");
	}, 1000);
}
function hideYouWinScreen() {
	const screen = document.getElementById("youWinScreen");
	screen.classList.add("fade-out");
	screen.addEventListener("transitionend", () => {
		hideScreen("youWin");
	});
}
///////////////////////////////////////////////////

//////////////////////////////////////////////////////
// HELPER FUNCTIONS --------------------------------//
//////////////////////////////////////////////////////
function showScreen(name) {
	stopInteraction();
	document.getElementById(name + "Screen").style.display = "flex";
}

function hideScreen(name) {
	document.getElementById(name + "Screen").style.display = "none";
	startInteraction();
}

//called when loading pre-existing game
function skipAllModalScreens() {
	document.querySelectorAll(".screen").forEach((screen) => {
		screen.style.display = "none";
	});
}

function setTitleScreenDate() {
	const currentDate = new Date();
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const month = months[currentDate.getMonth()];
	const day = currentDate.getDate();
	const year = currentDate.getFullYear();
	const formattedDate = `${month} ${day}, ${year}`;

	const dateElement = document.querySelector("#titleScreen #date");
	dateElement.textContent = formattedDate;
}
