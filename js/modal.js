//
//Title screen
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

function hideTitleScreen() {
	hideScreen("title");
}

function hideHelpScreen() {
	hideScreen("help");
}

function hideStatsScreen() {
	hideScreen("stats");
}

function showScreen(name) {
	document.getElementById(name + "Screen").style.display = "block";
}

function hideScreen(name) {
	document.getElementById(name + "Screen").style.display = "none";
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
