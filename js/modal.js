//
//Invoking the modal (help or stats)
//
document.getElementById("helpButton").addEventListener("click", function () {
	document.getElementById("helpScreen").style.display = "block";
});
document.getElementById("statsButton").addEventListener("click", function () {
	document.getElementById("statsScreen").style.display = "block";
});

//
//Closing the modal (help or stats)
//
document.querySelectorAll(".closeButton").forEach((closeButton) => {
	closeButton.addEventListener("click", function () {
		document.getElementById("helpScreen").style.display = "none";
		document.getElementById("statsScreen").style.display = "none";
	});
});

window.addEventListener("click", function (event) {
	if (event.target === document.getElementById("helpScreen")) {
		document.getElementById("helpScreen").style.display = "none";
	}
	if (event.target === document.getElementById("statsScreen")) {
		document.getElementById("statsScreen").style.display = "none";
	}
});
