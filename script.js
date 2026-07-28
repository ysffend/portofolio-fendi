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
   PROJECTS CAROUSEL
=============================== */
const track = document.getElementById("projectsTrack");
const prevBtn = document.getElementById("projectsPrev");
const nextBtn = document.getElementById("projectsNext");
const dotsWrap = document.getElementById("projectsDots");

if (track && prevBtn && nextBtn && dotsWrap) {
  const cards = Array.from(track.children);

  // build dots, one per card
  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", `Ke project ${i + 1}`);
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

  // drag-to-scroll for mouse/desktop users
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

// ================= EMAIL FUNCTION =================
// pastikan script emailjs sudah dipanggil di HTML

emailjs.init("ISI_PUBLIC_KEY_KAMU");

const form = document.getElementById("contactForm");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  emailjs.sendForm("ISI_SERVICE_ID", "ISI_TEMPLATE_ID", this).then(function () {
    alert("Pesan berhasil dikirim! ✅");
    form.reset();
  });
});

document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const nama = this.user_name.value;
  const email = this.user_email.value;
  const pesan = this.message.value;

  const isi = `Nama: ${nama}
Email: ${email}
Pesan:
${pesan}
--------------------------`;

  const blob = new Blob([isi], { type: "text/plain" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pesan.txt";
  a.click();

  this.reset();
});

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

/* ===============================
   INTERSECTION OBSERVER (ANIMASI SLIDE)
=============================== */
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.15, // Animasi aktif saat 15% elemen masuk layar
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, observerOptions);

// Daftarkan semua elemen animasi termasuk kartu prestasi
document
  .querySelectorAll(".fade-up, .stagger, .achievement-card")
  .forEach((el) => {
    observer.observe(el);
  });
