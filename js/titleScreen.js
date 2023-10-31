const titleScreen = document.getElementById("titleScreen");

document
	.getElementById("titleScreen-playButton")
	.addEventListener("click", function () {
		titleScreen.style.display = "none";
		document.getElementById("help").style.display = "block";
	});

document
	.getElementById("titleScreen-helpButton")
	.addEventListener("click", function () {
		titleScreen.style.display = "none";
		document.getElementById("help").style.display = "block";
	});
