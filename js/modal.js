var showTrigramReveal = true;

//
//Title screen set-up
//
const currentDate = new Date();
const formattedDate = getFormattedDate(currentDate);
document.querySelector("#titleScreen #date").textContent = formattedDate;

document.getElementById("playButton").addEventListener("click", function () {
	hideTitleScreen();
	showHelpScreen();
});
document.getElementById("howToButton").addEventListener("click", function () {
	hideTitleScreen();
	showHelpScreen();
});

//
//Invoking the modal (help or stats)
//
document.getElementById("helpButton").addEventListener("click", function () {
	showHelpScreen();
});
document.getElementById("statsButton").addEventListener("click", function () {
	showStatsScreen();
});

//
//Closing the modal (help or stats)
//
document.querySelectorAll(".closeButton").forEach((closeButton) => {
	closeButton.addEventListener("click", function () {
		hideHelpScreen();
		hideStatsScreen();
	});
});

window.addEventListener("click", function (event) {
	if (event.target === document.getElementById("helpScreen")) {
		hideHelpScreen();
	}
	if (event.target === document.getElementById("statsScreen")) {
		hideStatsScreen();
	}
});

function showHelpScreen() {
	showScreen("help");
}

function showStatsScreen() {
	showScreen("stats");
}

function showTrigramRevealScreen() {
	showScreen("trigramReveal");
	const screen = document.getElementById("trigramRevealScreen");

	setTimeout(() => {
		screen.classList.add("fade-out");
		screen.addEventListener("transitionend", () => {
			hideTrigramRevealScreen();
		});
		showTrigramReveal = false;
	}, 4000);
}

function hideTitleScreen() {
	hideScreen("title");
}

function hideHelpScreen() {
	hideScreen("help");
	if (showTrigramReveal) {
		showTrigramRevealScreen();
	}
}

function hideStatsScreen() {
	hideScreen("stats");
}

function hideTrigramRevealScreen() {
	hideScreen("trigramReveal");
}

function showScreen(name) {
	stopInteraction();
	document.getElementById(name + "Screen").style.display = "flex";
}

function hideScreen(name) {
	document.getElementById(name + "Screen").style.display = "none";
	startInteraction();
}

function getFormattedDate(date) {
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
	const month = months[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();

	return `${month} ${day}, ${year}`;
}
