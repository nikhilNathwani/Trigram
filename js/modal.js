document.getElementById("helpButton").addEventListener("click", function () {
	document.getElementById("help").style.display = "block";
});

document.querySelector(".close").addEventListener("click", function () {
	document.getElementById("help").style.display = "none";
	if (!titleScreenVisible && !titleSequenceOver) {
		startGame(5);
		titleSequenceOver = true;
	}
});

window.addEventListener("click", function (event) {
	if (event.target === document.getElementById("help")) {
		document.getElementById("help").style.display = "none";
	}
	if (!titleScreenVisible && !titleSequenceOver) {
		startGame(5);
		titleSequenceOver = true;
	}
});
