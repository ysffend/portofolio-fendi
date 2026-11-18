/* ===============================
   NAVBAR TOGGLE
=============================== */
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("nav ul");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.classList.toggle("open");
  });

  // Tutup menu otomatis saat salah satu link diklik (biar gak nyangkut kebuka)
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      menuToggle.classList.remove("open");
    });
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
   TYPING EFFECT - SUBTITLE
   Target: <h3 class="typing"></h3> di hero section
=============================== */
const subtitleText = "UI Futuristic • Responsive • Modern Web";
let subtitleIndex = 0;
const subtitleTyping = document.querySelector(".typing");

function typeSubtitle() {
  if (!subtitleTyping) return;
  if (subtitleIndex < subtitleText.length) {
    subtitleTyping.textContent += subtitleText.charAt(subtitleIndex);
    subtitleIndex++;
    setTimeout(typeSubtitle, 80);
  }
}
typeSubtitle();

/* ===============================
   TYPEWRITER — ABOUT ME
   (ngetik ulang HTML asli si <p>, jadi <strong> tetap kebold/warna,
    dan baru mulai pas section-nya kescroll ke pandangan)
=============================== */
const aboutTextEl = document.getElementById("aboutText");

if (aboutTextEl) {
  // Simpan HTML aslinya dulu, rapiin spasi/baris baru dari indentasi HTML,
  // baru kosongin elemennya (nanti diisi ulang pelan-pelan)
  const aboutOriginalHTML = aboutTextEl.innerHTML.trim().replace(/\s+/g, " ");
  aboutTextEl.innerHTML = "";

  function typeHTML(element, html, speed = 12) {
    let i = 0;
    element.classList.add("typing-cursor"); // kursor "|" berkedip selama ngetik

    function step() {
      if (i >= html.length) {
        element.classList.remove("typing-cursor"); // matiin kursor kalau udah selesai
        return;
      }

      if (html[i] === "<") {
        // ketemu tag (mis. <strong> atau </strong>) -> masukin utuh sekaligus,
        // jangan diketik huruf per huruf, biar HTML-nya nggak rusak
        const closeIndex = html.indexOf(">", i);
        element.innerHTML += html.slice(i, closeIndex + 1);
        i = closeIndex + 1;
      } else {
        // karakter teks biasa -> diketik satu per satu
        element.innerHTML += html[i];
        i++;
      }
      setTimeout(step, speed);
    }

    step();
  }

  // Baru mulai ngetik pas paragraf ini kescroll masuk ke layar
  const aboutObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeHTML(aboutTextEl, aboutOriginalHTML);
          aboutObserver.unobserve(entry.target); // cukup sekali aja
        }
      });
    },
    { threshold: 0.4 },
  );

  aboutObserver.observe(aboutTextEl);
}

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

// ================= TOAST NOTIFICATION =================
// Pengganti alert() bawaan browser, biar bisa didandanin sesuai tema web
function showToast(message, type = "success") {
  const toast = document.getElementById("toastNotif");
  const icon = document.getElementById("toastIcon");
  const text = document.getElementById("toastText");

  if (!toast || !icon || !text) return;

  icon.textContent = type === "success" ? "🚀" : "⚠️";
  text.textContent = message;

  toast.className = `toast-notif show ${type}`;

  // otomatis ilang lagi setelah 4 detik
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

// ================= FORM KRITIK & SARAN -> Formspree =================
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
          showToast(
            "Kritik & Saran berhasil dikirim langsung ke email Fendi!",
            "success",
          );
          contactForm.reset();
        } else {
          showToast(
            "Gagal mengirim. Pastikan form terisi dengan benar.",
            "error",
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showToast(
          "Terjadi kesalahan jaringan lokal. Coba deploy ke Vercel terlebih dahulu.",
          "error",
        );
      })
      .finally(() => {
        button.textContent = originalText;
        button.disabled = false;
      });
  });
}

/* ===============================
   UNIVERSAL CAROUSEL INITIALIZER
=============================== */
function initCarousel({ trackId, prevId, nextId, dotsId }) {
  const track = document.getElementById(trackId);
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);
  const dotsWrap = document.getElementById(dotsId);

  if (!track || !prev || !next) return;

  const cards = Array.from(track.children);
  if (cards.length === 0) return;

  // Bikin Dots secara otomatis jika dots container tersedia
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", `Slide ${i + 1}`);
      dot.addEventListener("click", () => {
        cards[i].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      });
      dotsWrap.appendChild(dot);
    });
  }

  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

  function getStep() {
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || 0);
    const firstWidth = cards[0].getBoundingClientRect().width;
    return (firstWidth || 300) + gap;
  }

  function updateActiveState() {
    const step = getStep();
    if (step <= 0) return;
    const index = Math.min(
      cards.length - 1,
      Math.max(0, Math.round(track.scrollLeft / step)),
    );
    dots.forEach((d, i) => d.classList.toggle("active", i === index));

    prev.disabled = track.scrollLeft <= 6;
    next.disabled =
      track.scrollLeft >= track.scrollWidth - track.clientWidth - 6;
  }

  prev.addEventListener("click", () => {
    track.scrollBy({ left: -getStep(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    track.scrollBy({ left: getStep(), behavior: "smooth" });
  });

  track.addEventListener("scroll", () => {
    requestAnimationFrame(updateActiveState);
  });

  window.addEventListener("resize", updateActiveState);
  updateActiveState();
}

// Inisialisasi Carousel untuk Projects, Kepanitiaan, Prestasi, Pendidikan, & Contact
initCarousel({
  trackId: "projectsTrack",
  prevId: "projectsPrev",
  nextId: "projectsNext",
  dotsId: "projectsDots",
});

initCarousel({
  trackId: "orgTrack",
  prevId: "orgPrev",
  nextId: "orgNext",
  dotsId: "orgDots",
});

initCarousel({
  trackId: "achievementsTrack",
  prevId: "achievementsPrev",
  nextId: "achievementsNext",
  dotsId: "achievementsDots",
});

initCarousel({
  trackId: "eduTrack",
  prevId: "eduPrev",
  nextId: "eduNext",
  dotsId: "eduDots",
});

initCarousel({
  trackId: "contactTrack",
  prevId: "contactPrev",
  nextId: "contactNext",
  dotsId: "contactDots",
});

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

/* ===============================
   TYPING EFFECT - HERO NAME
=============================== */
function typeEffect(element, text, speed = 80) {
  if (!element) return;

  let index = 0;
  element.innerHTML = ""; // Mulai dari kosong

  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Panggil saat page load
const heroName = document.getElementById("heroName");
if (heroName) {
  typeEffect(heroName, "Muhammad Effendi Yusuf", 80);
}
