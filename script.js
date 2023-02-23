const trigram= "cat";
var targetLength= 5;

const form = document.querySelector('form');
const wordInput = document.querySelector('#wordInput');
const displayArea = document.querySelector('#displayArea');

const errorMessageDict= {
  "WRONG-LENGTH": `Word must be ${targetLength} letters long.`,  
  "TRIGRAM-MISSING": `Word must contain ${trigram.toUpperCase()}.`,
  "NOT-FOUND": "Word not found.",
}

wordInput.focus(); // Give focus to the input field when the page loads


// WORK IN PROGRESS
// Check typed chars against real-time constraints: 
//   1. Alpha letters only (don't let non-alpha chars be displayed at all)
//   2. Stay within targetLength (else display 'too many letters' error)
//   3. Don't allow copy/paste
form.addEventListener('input', function(event) {
  return;
});

// WORK IN PROGRESS
// Check submitted chars against post-submission constraints:
//   1. Stay within targetLength (else display 'too many letters' error)
//   2. Word contains trigram (else display 'doesn't contain [trigram]' error)
//   3. Word exists in dictionary (else display 'word not found' error)
form.addEventListener('submit', (event) => {
  // Prevent the form from refreshing page upon submission
  event.preventDefault(); 

  // Get the user's inputted text and confirm it meets constraints
  const word = wordInput.value.trim(); //ignore whitespace at start/end
  const [meetsConstraints, errors]= checkWord(word); 
  if (meetsConstraints) {
      addWordtoDisplayArea(word, word.indexOf(trigram));
      incrementTargetLength();
  }
  else {
    errors.forEach(item => console.log(errorMessageDict[item]));
  }
  //Clear input field and return keyboard focus to it
  wordInput.value = '';
  wordInput.focus();
});

// Checks whether the inputted word meets the constraints:
//    1. Word must be {targetLength} letters long
//    2. Word must contain {trigram}
//    3. Word must be in dictionary <-- NOT implemented yet
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
  console.log(targetLength,correctLength,trigram,includesTrigram,"Both:",correctLength && word.includes(trigram))
  return [correctLength && includesTrigram, errorCodes];
}

function addWordtoDisplayArea(word, trigramPosition) {
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