const keys = document.querySelectorAll(".key");
const input = document.querySelector(".input");

keys.forEach(key => {
  key.addEventListener("click", () => {
    input.value += key.dataset.letter;
  });
});

document.addEventListener("keydown", e => {
  const key = e.key.toUpperCase();
  const matchingKey = document.querySelector(`.key[data-letter="${key}"]`);
  if (matchingKey) {
    input.value += key;
  }
});