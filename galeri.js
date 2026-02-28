// Ambil semua gambar gallery
const images = document.querySelectorAll("article img");

// Ambil elemen modal
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalCaption = document.getElementById("modalCaption");
const closeBtn = document.querySelector(".close");

// Klik gambar → buka modal
images.forEach(img => {
  img.addEventListener("click", () => {
    modal.style.display = "flex";
    modalImg.src = img.src;
    modalCaption.textContent = img.alt;
  });
});

// Tutup modal via tombol
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Tutup modal via background
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});