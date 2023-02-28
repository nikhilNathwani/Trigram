const keys = document.querySelectorAll(".keyboard-key");
const input = document.querySelector("input");

keys.forEach(key => {
  key.addEventListener("click", () => { 
    input.value += key.dataset.letter; 
  });
});

document.addEventListener("keydown", e => {
  const key = e.key.toUpperCase();
  // console.log(e,e.key,e.key.toUpperCase());
  const matchingKey = document.querySelector(`.keyboard-key[data-letter="${key}"]`);
  // console.log(matchingKey);
  if (matchingKey) {
    input.value += key;
  }
});