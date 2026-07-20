import { getWeekString, getGameIDString } from "../calendar.js";
import { startInteraction, stopInteraction } from "../interactionHandler.js";
import { showRoundTitle, startBonusGame } from "./view.js";

// UP NEXT:
// -

// Load Font Awesome after title screen loads (icons only used in game screens)
// This gives it time to load before user clicks Play, avoiding pop-in
let fontAwesomeLoaded = false;
function loadFontAwesome() {
	if (fontAwesomeLoaded) return;
	fontAwesomeLoaded = true;

	const script = document.createElement("script");
	script.src = "https://kit.fontawesome.com/caba6ce64c.js";
	script.crossOrigin = "anonymous";
	document.head.appendChild(script);
}

// Load Font Awesome after a short delay to avoid blocking title screen render
setTimeout(loadFontAwesome, 100);

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

export function setTrigramRevealScreen(trigram) {
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
// A real <dialog> (see index.html + the .modal-content::backdrop rule in
// style.css), opened/closed via .showModal()/.close() below instead of the
// display-toggling showScreen()/hideScreen() the other screens use — for
// the Escape-to-close, focus trap, and inert-background behavior a plain
// div can't give for free.
const helpScreen = document.getElementById("helpScreen");

// Help button in game header
document.getElementById("helpButton").addEventListener("click", function () {
	showHelpScreen();
});

//Close (X) button in Help dialog
helpScreen.querySelector(".closeButton").addEventListener("click", function () {
	helpScreen.close();
});

//Clicking outside Help dialog closes it
helpScreen.addEventListener("click", function (event) {
	if (event.target === helpScreen) {
		helpScreen.close();
	}
});

// "close" fires no matter how the dialog closed — the button above, the
// outside click above, or the browser's own Escape-key handling, which
// bypasses both of those. Centralizing side effects here (rather than only
// in the button/click handlers) is what makes Escape behave correctly too.
helpScreen.addEventListener("close", function () {
	startInteraction();
	if (!trigramRevealShown) {
		showTrigramRevealScreen();
	}
});

function showHelpScreen() {
	stopInteraction();
	helpScreen.showModal();
}
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*          STATS SCREEN          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
// Also a real <dialog> — see the comment on helpScreen above.
const statsScreen = document.getElementById("statsScreen");

// Stats button in game header
document.getElementById("statsButton").addEventListener("click", function () {
	showStatsScreen();
});

//Close (X) button in Stats screen
statsScreen
	.querySelector(".closeButton")
	.addEventListener("click", function () {
		statsScreen.close();
	});

//Clicking outside Stats dialog closes it
statsScreen.addEventListener("click", function (event) {
	if (event.target === statsScreen) {
		statsScreen.close();
	}
});

// See the matching comment on helpScreen's "close" listener above.
statsScreen.addEventListener("close", function () {
	startInteraction();
});

export function showStatsScreen() {
	stopInteraction();
	statsScreen.showModal();
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

export function showYouWinScreen() {
	showScreen("youWin");
	const screen = document.getElementById("youWinScreen");
	screen.classList.add("fade-in");
}
export function hideYouWinScreen() {
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
let isMobile = false;

// Check if the device is a mobile device
function checkIsMobileDevice() {
	isMobile = /Mobi|Android/i.test(navigator.userAgent);
}

// Check if the device is in landscape mode
function isLandscape() {
	return window.innerHeight < window.innerWidth;
}

// Initial check for landscape mode on page load
window.addEventListener("load", function () {
	checkIsMobileDevice();
	if (isMobile && isLandscape()) {
		showScreen("noLandscape");
	}
});

// Check orientation when the window is resized,
// and show noLandscape screen accordingly
window.addEventListener("resize", function () {
	if (isMobile) {
		if (isLandscape()) {
			showScreen("noLandscape");
		} else {
			hideScreen("noLandscape");
		}
	}
});

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
export function isAnyScreenShown() {
	const screens = document.querySelectorAll(".screen");
	for (const screen of screens) {
		const style = window.getComputedStyle(screen);
		if (style.display != "none") {
			return true;
		}
	}
	return false;
}

export function skipAllModalScreens() {
	trigramRevealShown = true;
	document.querySelectorAll(".screen").forEach((screen) => {
		if (screen.tagName === "DIALOG") {
			screen.close(); // no-op if not open
		} else {
			screen.style.display = "none";
		}
	});
}
