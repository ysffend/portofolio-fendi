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
   PROJECTS CAROUSEL - REMOVED
   Featured Project section (static) menggantikan carousel
=============================== */
// Carousel dihapus, menggunakan static Featured Project section

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

/* ===============================
   CONTACT CAROUSEL
=============================== */
const contactTrack = document.getElementById("contactTrack");
const contactPrev = document.getElementById("contactPrev");
const contactNext = document.getElementById("contactNext");
const contactDotsWrap = document.getElementById("contactDots");

if (contactTrack && contactPrev && contactNext && contactDotsWrap) {
  const contactCards = Array.from(contactTrack.children);

  // Bikin Dots secara otomatis
  contactCards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", `Ke kontak ${i + 1}`);
    dot.addEventListener("click", () => {
      contactCards[i].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    });
    contactDotsWrap.appendChild(dot);
  });

  const contactDots = Array.from(contactDotsWrap.children);

  function getContactCardStep() {
    const style = getComputedStyle(contactTrack);
    const gap = parseFloat(style.columnGap || style.gap || 0);
    return contactCards[0].getBoundingClientRect().width + gap;
  }

  function updateContactActiveDot() {
    const index = Math.round(contactTrack.scrollLeft / getContactCardStep());
    contactDots.forEach((d, i) => d.classList.toggle("active", i === index));

    contactPrev.disabled = contactTrack.scrollLeft <= 4;
    contactNext.disabled =
      contactTrack.scrollLeft >=
      contactTrack.scrollWidth - contactTrack.clientWidth - 4;
  }

  contactPrev.addEventListener("click", () => {
    contactTrack.scrollBy({ left: -getContactCardStep(), behavior: "smooth" });
  });

  contactNext.addEventListener("click", () => {
    contactTrack.scrollBy({ left: getContactCardStep(), behavior: "smooth" });
  });

  contactTrack.addEventListener("scroll", () => {
    requestAnimationFrame(updateContactActiveDot);
  });

  window.addEventListener("resize", updateContactActiveDot);
  updateContactActiveDot();
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

const navlinks = document.querySelectorAll(".nav-link");
const liquidSvg = document.querySelector(".nav-liquid");
const liquidPath = document.querySelector(".liquid-path");

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    // Remove active dari semua
    navLinks.forEach((l) => l.classList.remove("active"));

    // Add active ke yang diklik
    link.classList.add("active");

    // Update posisi liquid effect
    const linkRect = link.getBoundingClientRect();
    const navRect = link.parentElement.getBoundingClientRect();
    const offsetLeft = linkRect.left - navRect.left;

    liquidSvg.style.transform = `translateX(${offsetLeft}px)`;

    // Smooth scroll (optional)
    // const targetId = link.getAttribute('href');
    // document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
  });
});

// Initialize position on load
window.addEventListener("load", () => {
  const activeLink = document.querySelector(".nav-link.active");
  if (activeLink) {
    const linkRect = activeLink.getBoundingClientRect();
    const navRect = activeLink.parentElement.getBoundingClientRect();
    const offsetLeft = linkRect.left - navRect.left;
    liquidSvg.style.transform = `translateX(${offsetLeft}px)`;
  }
});

const liquidpath = document.querySelector(".liquid-path");
let phase = 0;

setInterval(() => {
  phase += 0.02;
  const offset = Math.sin(phase) * 8;

  liquidPath.style.transform = `translateY(${offset}px)`;
}, 30);
