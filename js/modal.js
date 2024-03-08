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
	document.getElementById("helpScreen").style.display = "block";
}

function showStatsScreen() {
	document.getElementById("statsScreen").style.display = "block";
}

function hideHelpScreen() {
	document.getElementById("helpScreen").style.display = "none";
}

function hideStatsScreen() {
	document.getElementById("statsScreen").style.display = "none";
}
