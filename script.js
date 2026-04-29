document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const glow = document.querySelector(".cursor-glow");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const clientLogos = document.querySelectorAll(".client-track img");
const canvas = document.querySelector("[data-network]");
const ctx = canvas?.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const setHeaderState = () => {
  header?.classList.toggle("scrolled", window.scrollY > 24);
};

const setScrollProgress = () => {
  if (!scrollProgress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
};

setHeaderState();
setScrollProgress();
window.addEventListener(
  "scroll",
  () => {
    setHeaderState();
    setScrollProgress();
  },
  { passive: true },
);

menuButton?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  mobileNav?.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", isOpen);
  mobileNav?.setAttribute("aria-hidden", !isOpen);
});

mobileNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("menu-open");
    mobileNav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    mobileNav.setAttribute("aria-hidden", "true");
  });
});

clientLogos.forEach((logo) => {
  logo.addEventListener("error", () => {
    logo.hidden = true;
    logo.nextElementSibling?.classList.add("show");
  });
});

if (glow) {
  window.addEventListener(
    "pointermove",
    (event) => {
      glow.style.opacity = "1";
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    },
    { passive: true },
  );
}

const animateCounter = (element) => {
  const target = Number(element.dataset.count || 0);
  const duration = 1100;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toString();
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        entry.target.querySelectorAll("[data-count]").forEach(animateCounter);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 },
);

revealItems.forEach((item) => observer.observe(item));

counters.forEach((counter) => {
  const host = counter.closest(".reveal");
  if (!host) animateCounter(counter);
});

if (!reduceMotion.matches && parallaxItems.length) {
  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;

      parallaxItems.forEach((item, index) => {
        const strength = index === 0 ? 9 : 5;
        item.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
      });
    },
    { passive: true },
  );
}

const state = {
  width: 0,
  height: 0,
  points: [],
};

const createPoints = () => {
  if (!canvas) return;
  const count = Math.max(38, Math.floor(window.innerWidth / 26));
  state.points = Array.from({ length: count }, () => ({
    x: Math.random() * state.width,
    y: Math.random() * state.height,
    vx: (Math.random() - 0.5) * 0.34,
    vy: (Math.random() - 0.5) * 0.34,
    radius: Math.random() * 1.7 + 0.7,
  }));
};

const resizeCanvas = () => {
  if (!canvas || !ctx) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  state.width = rect.width;
  state.height = rect.height;
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  createPoints();
};

const drawNetwork = () => {
  if (!canvas || !ctx || reduceMotion.matches) return;
  ctx.clearRect(0, 0, state.width, state.height);

  state.points.forEach((point, index) => {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < 0 || point.x > state.width) point.vx *= -1;
    if (point.y < 0 || point.y > state.height) point.vy *= -1;

    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(53, 175, 230, 0.72)";
    ctx.fill();

    for (let next = index + 1; next < state.points.length; next += 1) {
      const other = state.points[next];
      const distance = Math.hypot(point.x - other.x, point.y - other.y);
      if (distance < 132) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = `rgba(35, 98, 215, ${0.18 * (1 - distance / 132)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(drawNetwork);
};

if (canvas && ctx) {
  resizeCanvas();
  drawNetwork();
  window.addEventListener("resize", resizeCanvas);
}
