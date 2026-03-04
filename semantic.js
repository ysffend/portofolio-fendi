// DARK MODE
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

// FADE IN ON SCROLL
const elements = document.querySelectorAll(".fade-in");

window.addEventListener("scroll", () => {
  elements.forEach(el => {
    const position = el.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;

    if (position < screenHeight - 100) {
      el.classList.add("show");
    }
  });
});

const btnDarkMode = document.getElementById("btnDarkMode");

btnDarkMode.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    btnDarkMode.textContent = "☀️ Mode Terang";
  } else {
    btnDarkMode.textContent = "🌙 Mode Gelap";
  }
});