const keys = document.querySelectorAll(".keyboard-key");
const input = document.querySelector("input");

keys.forEach(key => {
  key.addEventListener("click", () => { 
    console.log("Before:",input.value);
    input.value += key.dataset.letter; 
    console.log("After:",key.dataset.letter,input.value);
  });
});

document.addEventListener("keydown", e => {
  const key = e.key.toUpperCase();
  const matchingKey = document.querySelector(`.keyboard-key[data-letter="${key}"]`);
  if (matchingKey) {
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].value === "") {
        inputs[i].value = key;
        break;
      }
    }
  }
});