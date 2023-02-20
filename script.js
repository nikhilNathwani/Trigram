const trigram= "CAT";
const targetLength= 5;

const form = document.querySelector('form');
const wordInput = document.querySelector('#wordInput');
const displayArea = document.querySelector('#display-area');

wordInput.focus(); // Give focus to the input field when the page loads

//Where I left off:
//Ask ChatGPT this:
//
// My text input needs to meet multiple criteria:

// -Must be letters only (should not be able to type non-alphabet input)
// -Must contain the substring "CAT", and I want to console log an error if the user hits submit at their inputted word doesn't contain the substring "CAT"
// -Must be 5 letters long, and I want to console log an error if the user hits submit and their inputted word isn't 5 letters long. I also want to console.log an error if the user types more than 5 characters, even if they haven't hit submit yet

// how can I handle these 3 checks in a way that keeps my code clean but also secure
//

// WORK IN PROGRESS
// Check typed chars against real-time constraints: 
//   1. Alpha letters only (don't let non-alpha chars be displayed at all)
//   2. Stay within targetLength (else display 'too many letters' error)
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
  const status= checkWord(word);
  //Add checks for constraints here 

  //If word met constraints, add it to display area and tee up next input
  addWordtoDisplayArea(word);

  //Clear input field and return keyboard focus to it
  wordInput.value = '';
  wordInput.focus();
});

function checkWord(word) {
  return;
}

function addWordtoDisplayArea(word) {
  //Create row div
  const rowDiv = document.createElement('div');
  rowDiv.classList.add('word');

  //Create letter divs for each letter in the word
  for (let i = 0; i < word.length; i++) {
    const letterDiv = document.createElement('div');
    letterDiv.textContent = word[i];
    letterDiv.classList.add('letter');
    rowDiv.appendChild(letterDiv);
  }
  displayArea.appendChild(rowDiv);
}