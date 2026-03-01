const photos = document.querySelectorAll(".photo img");
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewerImg");
const closeBtn = document.getElementById("closeBtn");

// buka fullscreen
photos.forEach(photo => {
  photo.addEventListener("click", () => {
    viewer.style.display = "flex";
    viewerImg.src = photo.src;
  });
});

// tutup via tombol
closeBtn.addEventListener("click", () => {
  viewer.style.display = "none";
});

// tutup via tap background
viewer.addEventListener("click", (e) => {
  if (e.target === viewer) {
    viewer.style.display = "none";
  }
});