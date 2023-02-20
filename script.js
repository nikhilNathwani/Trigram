const trigram= "CAT";
const targetLength= 5;

const form = document.querySelector('form');
const wordInput = document.querySelector('#wordInput');
const displayArea = document.querySelector('#display-area');

wordInput.focus(); // give focus to the input field when the page loads

form.addEventListener('submit', (event) => {
  // Prevent the form from refreshing page upon submission
  event.preventDefault(); 

  // Get the user's inputted text and confirm it meets constraints
  const word = wordInput.value.trim(); //ignore whitespace at start/end
  const status= checkWord(word)
  //Add checks for constraints here 

  //If word met constraints, add it to display area and tee up next input
  addWordtoDisplayArea(word);

  //Clear input field and return keyboard focus to it
  wordInput.value = '';
  wordInput.focus();

  // displayArea.textContent += word+"   "; // add text to output div
});


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