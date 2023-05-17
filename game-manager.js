const trigram = "CAT";
var targetLength = 5;

const form = document.querySelector("form");
const displayArea = document.querySelector("#displayArea");

// Returns [x,[y]] where:
//    -x is true/false indicating whether the inputted word meets the constraints
//    -y is an array of strings indicating which error messages to display
function checkWord(word) {
	var errorCodes = [];
	var correctLength = word.length == targetLength;
	var includesTrigram = word.includes(trigram);
	//Add error codes
	if (!correctLength) {
		errorCodes.push("WRONG-LENGTH");
	}
	if (!includesTrigram) {
		errorCodes.push("TRIGRAM-MISSING");
	}
	return [correctLength && includesTrigram, errorCodes];
}

function addErrorToErrorDisplayArea(errorCode) {
	const errorArea = document.querySelector("#errorAlertArea");
	const errorString = document.createElement("p");
	errorString.textContent = lookupErrorString(errorCode);
	errorString.classList.add("error");
	errorArea.appendChild(errorString);
	return;
}

function lookupErrorString(errorCode) {
	switch (errorCode) {
		case "WRONG-LENGTH":
			return `Word must be ${targetLength} letters long.`;
		case "TRIGRAM-MISSING":
			return `Word must contain ${trigram}.`;
		case "NOT-FOUND":
			return "Word not found.";
		default:
			return "An error occurred.";
	}
}

function clearExistingErrors() {
	const errorArea = document.querySelector("#errorAlertArea");
	errorArea.innerHTML = "";
}

function addWordToDisplayArea(word, trigramPosition) {
	//Create row div
	const rowDiv = document.createElement("div");
	rowDiv.classList.add("word");
	//Create letter divs for each letter in the word
	for (let i = 0; i < word.length; i++) {
		const letterDiv = document.createElement("div");
		letterDiv.textContent = word[i];
		letterDiv.classList.add("letter");
		//If it's a trigram letter, apply trigram styling
		if (i >= trigramPosition && i <= trigramPosition + 2) {
			letterDiv.classList.add("trigramLetter");
		}
		rowDiv.appendChild(letterDiv);
	}
	displayArea.appendChild(rowDiv);
}

function incrementTargetLength() {
	//Increment value on backend
	targetLength++;

	//Increment value on frontend (TEMPORARILY REMOVED)
	// const targetLengthUI = document.querySelector("#targetLength");
	// targetLengthUI.innerText = parseInt(targetLengthUI.innerText) + 1;
	//^may want to add error handling. E.g. if targetLengthUI is
	//changed to a non-integer value in dev tools. Or change it
	//from a <p> to an immutable svg
}
