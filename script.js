const trigram= "cat";
var targetLength= 5;

const form = document.querySelector('form');
const wordInput = document.querySelector('#wordInput');
const displayArea = document.querySelector('#displayArea');

// Check submitted chars against post-submission constraints:
form.addEventListener('submit', (event) => {
  // Prevent the form from refreshing page upon submission
  event.preventDefault(); 

  // Clear any existing error messages
  clearExistingErrors();

  // Get the user's inputted text and check if it meets constraints
  const word = wordInput.value.trim(); //ignore whitespace at start/end
  const [meetsConstraints, errors]= checkWord(word); 
  if (meetsConstraints) {
      addWordToDisplayArea(word, word.indexOf(trigram));
      incrementTargetLength();
  }
  else {
    errors.forEach(errorCode => addErrorToErrorDisplayArea(errorCode));
  }

  //Clear input field and return keyboard focus to it
  wordInput.value = '';
});

// Checks whether the inputted word meets the constraints:
//    1. [DONE] Word must be {targetLength} letters long
//    2. [DONE] Word must contain {trigram}
//    3. [PENDING] Word must be in dictionary
// Returns [x,[y]] where:
//    -x is true/false indicating whether the inputted word meets the constraints
//    -y is an array of strings indicating which error messages to display 
function checkWord(word) {
  var errorCodes= [];
  var correctLength= word.length == targetLength;
  var includesTrigram= word.includes(trigram);
  //Add error codes
  if (!correctLength) {
    errorCodes.push("WRONG-LENGTH");
  }
  if (!includesTrigram) {
    errorCodes.push("TRIGRAM-MISSING")
  }
  return [correctLength && includesTrigram, errorCodes];
}

function addErrorToErrorDisplayArea(errorCode) {
  const errorArea = document.querySelector('#errorAlertArea');
  const errorString = document.createElement('p');
  errorString.textContent= lookupErrorString(errorCode);
  errorString.classList.add('error');
  errorArea.appendChild(errorString)
  return;
}

function lookupErrorString(errorCode) {
  switch (errorCode) {
    case "WRONG-LENGTH": 
      return `Word must be ${targetLength} letters long.`;
    case "TRIGRAM-MISSING":
      return `Word must contain ${trigram.toUpperCase()}.`;
    case "NOT-FOUND":
      return "Word not found.";
    default:
      return "An error occurred.";
  }
}

function clearExistingErrors() {
  const errorArea = document.querySelector('#errorAlertArea');
  errorArea.innerHTML= "";
}

function addWordToDisplayArea(word, trigramPosition) {
  //Create row div
  const rowDiv = document.createElement('div');
  rowDiv.classList.add('word');

  //Create letter divs for each letter in the word
  for (let i = 0; i < word.length; i++) {
    const letterDiv = document.createElement('div');
    letterDiv.textContent = word[i];
    letterDiv.classList.add('letter');
    //If it's a trigram letter, apply trigram styling
    if (i>=trigramPosition && i<=trigramPosition+2) {
      letterDiv.classList.add('trigramLetter');
    }
    rowDiv.appendChild(letterDiv);
  }
  displayArea.appendChild(rowDiv);
}

function incrementTargetLength() {
  //Increment value on backend
  targetLength++; 
  //Increment value on frontend
  const targetLengthUI= document.querySelector('#targetLength');
  targetLengthUI.innerText= parseInt(targetLengthUI.innerText)+1 
  //^may want to add error handling. E.g. if targetLengthUI is 
  //changed to a non-integer value in dev tools. Or change it 
  //from a <p> to an immutable svg
}