/* ===============================
   NAVBAR TOGGLE
=============================== */
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("nav ul");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

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
  if (!scrollProgress) return;
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

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light");

    // switch icon
    if (document.body.classList.contains("light")) {
      themeBtn.textContent = "🌞";
    } else {
      themeBtn.textContent = "🌙";
    }
  });
}

// ================= EMAIL FUNCTION =================
// pastikan script emailjs sudah dipanggil di HTML

if (typeof emailjs !== "undefined") {
  emailjs.init("ISI_PUBLIC_KEY_KAMU");
}

const form = document.getElementById("contactForm");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (typeof emailjs !== "undefined") {
      emailjs
        .sendForm("ISI_SERVICE_ID", "ISI_TEMPLATE_ID", this)
        .then(function () {
          alert("Pesan berhasil dikirim! ✅");
          form.reset();
        });
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nama = this.user_name ? this.user_name.value : "";
    const email = this.user_email ? this.user_email.value : "";
    const pesan = this.message ? this.message.value : "";

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
}

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
   ACHIEVEMENTS CAROUSEL
=============================== */
const achTrack = document.getElementById("achievementsTrack");
const achPrev = document.getElementById("achievementsPrev");
const achNext = document.getElementById("achievementsNext");
const achDotsWrap = document.getElementById("achievementsDots");

if (achTrack && achPrev && achNext && achDotsWrap) {
  const achCards = Array.from(achTrack.children);

  // Bikin Dots secara otomatis
  achCards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", `Ke prestasi ${i + 1}`);
    dot.addEventListener("click", () => {
      achCards[i].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    });
    achDotsWrap.appendChild(dot);
  });

  const achDots = Array.from(achDotsWrap.children);

  function getAchCardStep() {
    const style = getComputedStyle(achTrack);
    const gap = parseFloat(style.columnGap || style.gap || 0);
    return achCards[0].getBoundingClientRect().width + gap;
  }

  function updateAchActiveDot() {
    const index = Math.round(achTrack.scrollLeft / getAchCardStep());
    achDots.forEach((d, i) => d.classList.toggle("active", i === index));

    achPrev.disabled = achTrack.scrollLeft <= 4;
    achNext.disabled =
      achTrack.scrollLeft >= achTrack.scrollWidth - achTrack.clientWidth - 4;
  }

  achPrev.addEventListener("click", () => {
    achTrack.scrollBy({ left: -getAchCardStep(), behavior: "smooth" });
  });

  achNext.addEventListener("click", () => {
    achTrack.scrollBy({ left: getAchCardStep(), behavior: "smooth" });
  });

  achTrack.addEventListener("scroll", () => {
    requestAnimationFrame(updateAchActiveDot);
  });

  window.addEventListener("resize", updateAchActiveDot);
  updateAchActiveDot();
}

/* ===============================
   EDUCATION CAROUSEL
=============================== */
const eduTrack = document.getElementById("eduTrack");
const eduPrev = document.getElementById("eduPrev");
const eduNext = document.getElementById("eduNext");
const eduDotsWrap = document.getElementById("eduDots");

if (eduTrack && eduPrev && eduNext && eduDotsWrap) {
  const eduCards = Array.from(eduTrack.children);

  // Bikin Dots secara otomatis
  eduCards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", `Ke pendidikan ${i + 1}`);
    dot.addEventListener("click", () => {
      eduCards[i].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    });
    eduDotsWrap.appendChild(dot);
  });

  const eduDots = Array.from(eduDotsWrap.children);

  function getEduCardStep() {
    const style = getComputedStyle(eduTrack);
    const gap = parseFloat(style.columnGap || style.gap || 0);
    return eduCards[0].getBoundingClientRect().width + gap;
  }

  function updateEduActiveDot() {
    const index = Math.round(eduTrack.scrollLeft / getEduCardStep());
    eduDots.forEach((d, i) => d.classList.toggle("active", i === index));

    eduPrev.disabled = eduTrack.scrollLeft <= 4;
    eduNext.disabled =
      eduTrack.scrollLeft >= eduTrack.scrollWidth - eduTrack.clientWidth - 4;
  }

  eduPrev.addEventListener("click", () => {
    eduTrack.scrollBy({ left: -getEduCardStep(), behavior: "smooth" });
  });

  eduNext.addEventListener("click", () => {
    eduTrack.scrollBy({ left: getEduCardStep(), behavior: "smooth" });
  });

  eduTrack.addEventListener("scroll", () => {
    requestAnimationFrame(updateEduActiveDot);
  });

  window.addEventListener("resize", updateEduActiveDot);
  updateEduActiveDot();
}

/* ===================================================
   SLIDE-IN OBSERVER (TIMELINE, CONTACT, & ACHIVEMENTS)
=================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          slideObserver.unobserve(entry.target); // Jalankan animasi 1x
        }
      });
    },
    { threshold: 0.15 }, // Trigger saat 15% elemen masuk layar
  );

  // Ambil semua elemen yang ingin diberi animasi slide
  const slideElements = document.querySelectorAll(
    ".timeline-item, .contact-final-item, .achievement-card, .skill-card",
  );

  slideElements.forEach((el) => {
    slideObserver.observe(el);
  });
});
