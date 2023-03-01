const keys = document.querySelectorAll(".keyboard-key");
const input = document.querySelector("input");

keys.forEach(key => {
  key.addEventListener("click", () => { 
    input.value += key.dataset.letter; 
  });
});

document.addEventListener("keydown", e => {
  //If key is 'Enter', treat as a Submit action
  if (e.key === "Enter") {
    submitWord();
  }
  //If key is 'Backspace', delete last char (if there is one)
  if (e.key === "Backspace") {
    if (input.value.length>0) {
      input.value= input.value.slice(0,-1);
    }
  }

  const key = e.key.toUpperCase();
  console.log(e,e.key,e.key.toUpperCase());
  const matchingKey = document.querySelector(`.keyboard-key[data-letter="${key}"]`);
  // console.log(matchingKey);
  if (matchingKey) {
    input.value += key;
  }
});