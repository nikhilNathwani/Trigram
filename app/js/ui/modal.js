import { getWeekString, getGameIDString } from "../calendar.js";
import { startInteraction, stopInteraction } from "../interactionHandler.js";
import { showRoundTitle, startBonusGame } from "./view.js";

// Naming convention for the six full-page layers in index.html, split into
// two categories that behave differently on purpose:
//
// *Screen (titleScreen, trigramRevealScreen, youWinScreen,
// noLandscapeScreen) — the app shows/hides these on its own schedule, via
// the generic showScreen()/hideScreen() below. None are user-dismissable:
// no close button, no backdrop click, no Escape handling. That's
// intentional per-screen (e.g. youWinScreen forces a Bonus Round/View
// Stats choice), not an oversight.
//
// *Dialog (helpDialog, statsDialog) — real <dialog> elements the user
// opens and closes at will (close button, backdrop click, or Escape all
// work). This is the only category where "dismissable" is actually wanted,
// which is why only these two are <dialog>-based — see each one's own
// section below for why the others aren't.
//
// The `.screen` CSS class is used by both categories — the generic marker
// isAnyScreenShown()/skipAllModalScreens() use to bulk-query all six
// layers, *Screen and *Dialog alike.

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
// *Screen, not *Dialog: this isn't an overlay on top of other content at
// all — it's the app's base/first screen, so <dialog> semantics (a
// temporary interruption over primary content) don't apply.
setTitleScreenWeek();
setTitleScreenGameNumber();

document.getElementById("playButton").addEventListener("click", function () {
	hideTitleScreen();
	// startGame();
	showHelpDialog();
});
document.getElementById("howToButton").addEventListener("click", function () {
	hideTitleScreen();
	// startGame();
	showHelpDialog();
});

function hideTitleScreen() {
	hideScreen("titleScreen");
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
/*          TRIGRAM REVEAL          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
// *Screen, not *Dialog: this is a timed splash with no user-facing dismiss
// action today. Making it a <dialog> would need to *add* a "cancel"
// listener suppressing Escape (dialogs close on Escape by default) just to
// preserve that — more code to fight the platform default, not less.
var trigramRevealShown = false;

export function setTrigramRevealScreen(trigram) {
	const trigramReveal = document.getElementById("trigramReveal");
	trigramReveal.innerHTML = trigram
		.split("")
		.map((char) => `<span>${char}</span>`)
		.join("");

	const trigramRevealSubtitle = document.getElementById(
		"trigramRevealSubtitle",
	);
	trigramRevealSubtitle.textContent =
		'Your words must contain "' + trigram + '"';
}

function showTrigramRevealScreen() {
	//show screen then fade out after 4 seconds
	showScreen("trigramRevealScreen");
	const screen = document.getElementById("trigramRevealScreen");
	screen.classList.add("showTemporarily");
	screen.addEventListener("animationend", () => {
		hideTrigramRevealScreen();
		showRoundTitle(1);
	});
	trigramRevealShown = true;
}

function hideTrigramRevealScreen() {
	hideScreen("trigramRevealScreen");
}
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*           HELP DIALOG          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
// A real <dialog> (see index.html + the .modal-content::backdrop rule in
// dialogs.css), opened/closed via .showModal()/.close() below instead of the
// display-toggling showScreen()/hideScreen() the *Screen elements use — for
// the Escape-to-close, focus trap, and inert-background behavior a plain
// div can't give for free. The user genuinely dismisses this at will, so
// (unlike trigramRevealScreen/youWinScreen/noLandscapeScreen) that's a
// behavior worth having, not one to suppress.
const helpDialog = document.getElementById("helpDialog");

// Help button in game header
document.getElementById("helpButton").addEventListener("click", function () {
	showHelpDialog();
});

//Close (X) button in Help dialog
helpDialog.querySelector(".closeButton").addEventListener("click", function () {
	helpDialog.close();
});

//Clicking outside Help dialog closes it
helpDialog.addEventListener("click", function (event) {
	if (event.target === helpDialog) {
		helpDialog.close();
	}
});

// "close" fires no matter how the dialog closed — the button above, the
// outside click above, or the browser's own Escape-key handling, which
// bypasses both of those. Centralizing side effects here (rather than only
// in the button/click handlers) is what makes Escape behave correctly too.
helpDialog.addEventListener("close", function () {
	startInteraction();
	if (!trigramRevealShown) {
		showTrigramRevealScreen();
	}
});

function showHelpDialog() {
	stopInteraction();
	helpDialog.showModal();
}
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*          STATS DIALOG          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
// Also a real <dialog> — see the comment on helpDialog above.
const statsDialog = document.getElementById("statsDialog");

// Stats button in game header
document.getElementById("statsButton").addEventListener("click", function () {
	showStatsDialog();
});

//Close (X) button in Stats screen
statsDialog
	.querySelector(".closeButton")
	.addEventListener("click", function () {
		statsDialog.close();
	});

//Clicking outside Stats dialog closes it
statsDialog.addEventListener("click", function (event) {
	if (event.target === statsDialog) {
		statsDialog.close();
	}
});

// See the matching comment on helpDialog's "close" listener above.
statsDialog.addEventListener("close", function () {
	startInteraction();
});

export function showStatsDialog() {
	stopInteraction();
	statsDialog.showModal();
}
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*            YOU WIN             */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
// *Screen, not *Dialog: the player must choose Bonus Round or View Stats —
// this is deliberately not dismissable by backdrop click or Escape.

//View Stats button in You Win screen
document
	.getElementById("viewStatsButton")
	.addEventListener("click", function () {
		showStatsDialog();
	});

//Bonus Round button in You Win screen
document
	.getElementById("bonusRoundButton")
	.addEventListener("click", function () {
		startBonusGame();
	});

export function showYouWinScreen() {
	showScreen("youWinScreen");
	const screen = document.getElementById("youWinScreen");
	screen.classList.add("fade-in");
}
export function hideYouWinScreen() {
	const screen = document.getElementById("youWinScreen");
	// screen.classList.remove("fade-in");
	screen.classList.add("fade-out");
	screen.addEventListener("animationend", () => {
		hideScreen("youWinScreen");
	});
}
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*          ROTATE SCREEN          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
//
// *Screen, not *Dialog: there's no dismiss action at all today (only a
// device-rotation resize handler hides it) — dismissing it wouldn't make
// the app fit the viewport anyway, so a <dialog>'s free Escape-to-close
// would need suppressing, not using.
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
		showScreen("noLandscapeScreen");
	}
});

// Check orientation when the window is resized,
// and show noLandscape screen accordingly
window.addEventListener("resize", function () {
	if (isMobile) {
		if (isLandscape()) {
			showScreen("noLandscapeScreen");
		} else {
			hideScreen("noLandscapeScreen");
		}
	}
});

//////////////////////////////////////////////////////
// HELPER FUNCTIONS --------------------------------//
//////////////////////////////////////////////////////
// Shared display-toggle plumbing for every *Screen element (not *Dialog,
// which uses .showModal()/.close() instead) — takes the element's exact
// id directly rather than auto-appending "Screen" to a short name, so
// every call site is equally explicit regardless of which screen it is.
function showScreen(id) {
	stopInteraction();
	document.getElementById(id).style.display = "flex";
}

function hideScreen(id) {
	document.getElementById(id).style.display = "none";
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
