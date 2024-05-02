// UP NEXT:
// -MAYBE Trigram Reveal Screen animate trigram reveal
// -MAYBE Make Help Screen trigram & word list consistent with stats

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*          TITLE SCREEN          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
setTitleScreenWeek();
setTitleScreenGameNumber();

document.getElementById("playButton").addEventListener("click", function () {
	hideTitleScreen();
	// startGame();
	showHelpScreen();
});
document.getElementById("howToButton").addEventListener("click", function () {
	hideTitleScreen();
	// startGame();
	showHelpScreen();
});

function hideTitleScreen() {
	hideScreen("title");
}

function setTitleScreenWeek() {
	const dateElement = document.querySelector("#titleScreen #date");
	dateElement.textContent = getWeekString();
}

function setTitleScreenGameNumber() {
	const gameNumElement = document.querySelector("#titleScreen #gameNumber");
	gameNumElement.textContent = "No. " + getGameIDString();
}

///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*     TRIGRAM REVEAL OVERLAY     */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
var trigramRevealShown = false;

function setTrigramRevealScreen(trigram) {
	const trigramReveal = document.getElementById("trigramReveal");
	trigramReveal.innerHTML = trigram
		.split("")
		.map((char) => `<span>${char}</span>`)
		.join("");

	const trigramRevealSubtitle = document.getElementById(
		"trigramRevealSubtitle"
	);
	trigramRevealSubtitle.textContent =
		'Your words must contain "' + trigram + '"';
}

function showTrigramRevealScreen() {
	//show screen then fade out after 4 seconds
	showScreen("trigramReveal");
	const screen = document.getElementById("trigramRevealScreen");
	screen.classList.add("showTemporarily");
	screen.addEventListener("animationend", () => {
		hideTrigramRevealScreen();
		showRoundTitle(1);
	});
	trigramRevealShown = true;
}

function hideTrigramRevealScreen() {
	hideScreen("trigramReveal");
}
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
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
		startBonusGame();
	});

function showYouWinScreen() {
	showScreen("youWin");
	const screen = document.getElementById("youWinScreen");
	screen.classList.add("fade-in");
}
function hideYouWinScreen() {
	const screen = document.getElementById("youWinScreen");
	// screen.classList.remove("fade-in");
	screen.classList.add("fade-out");
	screen.addEventListener("animationend", () => {
		hideScreen("youWin");
	});
}
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*          ROTATE SCREEN          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//

// Check if the device is in landscape mode
function isLandscape() {
	return window.innerHeight < window.innerWidth;
}

// Check orientation when the window is resized,
// and show noLandscape screen accordingly
window.addEventListener("resize", function () {
	if (isLandscape()) {
		document.getElementById("noLandscapeScreen").style.display = "block";
	} else {
		document.getElementById("noLandscapeScreen").style.display = "none";
	}
});

// Initial check on page load
if (isLandscape()) {
	document.getElementById("noLandscapeScreen").style.display = "block";
}

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
function isAnyScreenShown() {
	const screens = document.querySelectorAll(".screen");
	for (const screen of screens) {
		const style = window.getComputedStyle(screen);
		if (style.display != "none") {
			return true;
		}
	}
	return false;
}

function skipAllModalScreens() {
	trigramRevealShown = true;
	document.querySelectorAll(".screen").forEach((screen) => {
		screen.style.display = "none";
	});
}
