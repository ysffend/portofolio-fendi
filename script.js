/* ===============================
   NAVBAR TOGGLE
=============================== */
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("nav ul");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

/* ===============================
   INTERSECTION OBSERVER (FINAL)
=============================== */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.2 },
);

document.querySelectorAll(".fade-up, .stagger").forEach((el) => {
  observer.observe(el);
});

/* ===============================
   PROJECTS & ACHIEVEMENTS CAROUSEL
=============================== */
function setupCarousel(trackId, prevId, nextId, dotsId) {
  const track = document.getElementById(trackId);
  const prevBtn = document.getElementById(prevId);
  const nextBtn = document.getElementById(nextId);
  const dotsWrap = document.getElementById(dotsId);

  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  const cards = Array.from(track.children);

  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", `Item ${i + 1}`);
    dot.addEventListener("click", () => {
      cards[i].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function cardStep() {
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || 0);
    return cards[0].getBoundingClientRect().width + gap;
  }

  function updateActiveDot() {
    const index = Math.round(track.scrollLeft / cardStep());
    dots.forEach((d, i) => d.classList.toggle("active", i === index));

    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled =
      track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
  }

  prevBtn.addEventListener("click", () => {
    track.scrollBy({ left: -cardStep(), behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    track.scrollBy({ left: cardStep(), behavior: "smooth" });
  });

  track.addEventListener("scroll", () => {
    requestAnimationFrame(updateActiveDot);
  });

  window.addEventListener("resize", updateActiveDot);
  updateActiveDot();

  let isDown = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener("mousedown", (e) => {
    isDown = true;
    track.classList.add("dragging");
    startX = e.pageX;
    startScroll = track.scrollLeft;
  });

  window.addEventListener("mouseup", () => {
    isDown = false;
    track.classList.remove("dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    track.scrollLeft = startScroll - (e.pageX - startX);
  });
}

setupCarousel("projectsTrack", "projectsPrev", "projectsNext", "projectsDots");

setupCarousel(
  "achievementsTrack",
  "achievementsPrev",
  "achievementsNext",
  "achievementsDots",
);

/* ===============================
   TYPING EFFECT
=============================== */
const text = "UI Futuristic • Responsive • Modern Web";
let index = 0;
const typing = document.querySelector(".typing");

function typeEffect() {
  if (!typing) return;
  if (index < text.length) {
    typing.textContent += text.charAt(index);
    index++;
    setTimeout(typeEffect, 80);
  }
}
typeEffect();

/* ===============================
   PARTICLES BACKGROUND
=============================== */
const canvas = document.getElementById("particles");
if (canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  window.addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  });

  let particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: Math.random() - 0.5,
    vy: Math.random() - 0.5,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#00f0ff";
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* =============================
   SCROLL PROGRESS SCRIPT
============================= */

const scrollProgress = document.getElementById("scroll-progress");

window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const scrollPercent = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = scrollPercent + "%";
});

/* =========================
   DARK / LIGHT THEME TOGGLE
=========================== */

const themeBtn = document.getElementById("themeToggle");

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");

  // switch icon
  if (document.body.classList.contains("light")) {
    themeBtn.textContent = "🌞";
  } else {
    themeBtn.textContent = "🌙";
  }
});

// ================= EMAIL FUNCTION (Formspree) =================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Menahan refresh halaman

    const button = contactForm.querySelector('button[type="submit"]');
    const originalText = button.textContent;

    button.textContent = "Mengirim...";
    button.disabled = true;

    // Menggunakan FormData agar formatnya otomatis dikenali Formspree
    const formData = new FormData(contactForm);

    fetch("https://formspree.io/f/mkodoqrn", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          alert("🚀 Kritik & Saran berhasil dikirim langsung ke email Fendi!");
          contactForm.reset();
        } else {
          alert("🛰️ Gagal mengirim. Pastikan form terisi dengan benar.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(
          "📡 Terjadi kesalahan jaringan lokal. Coba deploy ke Vercel terlebih dahulu.",
        );
      })
      .finally(() => {
        button.textContent = originalText;
        button.disabled = false;
      });
  });
}
