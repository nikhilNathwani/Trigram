const keys = document.querySelectorAll(".keyboard-key");
const input = document.querySelector("input");

//Event listeners for clicking on the on-screen keyboard
keys.forEach((key) => {
	key.addEventListener("click", () => {
		console.log("Click event:", key);
		if (key.id == "enterKey") {
			handleKeyPress("Enter");
		} else if (key.id == "backspaceKey") {
			handleKeyPress("Backspace");
		} else {
			handleKeyPress(key.dataset.letter);
		}
	});
});

//Event listener for typing on physical keyboard
document.addEventListener("keydown", (e) => {
	console.log("Keydown event:", e);
	handleKeyPress(e.key);
});

function handleKeyPress(key) {
	//If key is 'Enter', treat as a Submit action
	if (key === "Enter") {
		submitWord();
	} else if (key === "Backspace") {
		if (input.value.length > 0) {
			input.value = input.value.slice(0, -1);
		}
	} else {
		const letter = key.toUpperCase();
		const matchingKey = document.querySelector(
			`.keyboard-key[data-letter="${letter}"]`
		);
		if (matchingKey) {
			input.value += letter;
		}
	}
}
