document.addEventListener("DOMContentLoaded", () => {

  /* =============================
     INTERSECTION OBSERVER (ALL)
  ============================= */

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active", "show");
        }
      });
    },
    { threshold: 0.15 }
  );

  document
    .querySelectorAll(".fade-up, .stagger")
    .forEach(el => observer.observe(el));


  /* =============================
     TYPING EFFECT
  ============================= */

  const text = "UI Futuristic • Responsive • Modern Web";
  let index = 0;
  const typing = document.querySelector(".typing");

  function typeEffect() {
    if (typing && index < text.length) {
      typing.textContent += text.charAt(index);
      index++;
      setTimeout(typeEffect, 80);
    }
  }
  typeEffect();


  /* =============================
     PARTICLES BACKGROUND
  ============================= */

  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: Math.random() - 0.5,
    vy: Math.random() - 0.5,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
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

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

});