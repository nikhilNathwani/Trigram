const form = document.querySelector('form');
const input = document.querySelector('#userInput');
const output = document.querySelector('#display-area');

input.focus(); // give focus to the input field when the page loads

form.addEventListener('submit', (event) => {
  event.preventDefault(); // prevent the form from refreshing page upon submission

  const text = input.value; // get the user's inputted text
  output.textContent += text+"   "; // add text to output div
  input.value = ''; //clear input field after submissiont
  input.focus(); // give focus back to the input field
});