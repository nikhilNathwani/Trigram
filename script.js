const app = document.getElementById("app");
const container = document.getElementById("game");
const scrollButton = document.getElementById("scrollButton");

let currentChildIndex = 0;

scrollButton.addEventListener("click", () => {
	currentChildIndex++;
	if (currentChildIndex >= 4) {
		app.classList.toggle("round-4");
		app.classList.toggle("round-1");
		currentChildIndex = 0;
	} else {
		app.classList.toggle("round-" + currentChildIndex);
		app.classList.toggle("round-" + (currentChildIndex + 1));
	}
	// Array.from(container.children).forEach((round) => {
	// 	round.classList.toggle("round-" + currentChildIndex);
	// 	round.classList.toggle("round-" + (currentChildIndex + 1));
	// });
});
