const keys = document.querySelectorAll(".keyboard-key");
const inputs = document.querySelectorAll(".input input");

keys.forEach(key => {
  key.addEventListener("click", () => {
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].value === "") {
        inputs[i].value = key.dataset.letter;
        break;
      }
    }
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
