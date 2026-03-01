const cards = document.querySelectorAll(".card img");
const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");
const closePreview = document.getElementById("closePreview");

// buka preview
cards.forEach(img => {
  img.addEventListener("click", () => {
    preview.classList.add("active");
    previewImg.src = img.src;
  });
});

// tutup preview
closePreview.addEventListener("click", () => {
  preview.classList.remove("active");
});

// klik background untuk tutup
preview.addEventListener("click", (e) => {
  if (e.target === preview) {
    preview.classList.remove("active");
  }
});