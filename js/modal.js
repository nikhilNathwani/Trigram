//
//Title screen
//
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
