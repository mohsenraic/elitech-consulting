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

const floatingCta = document.querySelector("[data-floating-cta]");

const setFloatingCta = () => {
  if (!floatingCta) return;
  floatingCta.classList.toggle("visible", window.scrollY > 500);
};

setHeaderState();
setScrollProgress();
setFloatingCta();
window.addEventListener(
  "scroll",
  () => {
    setHeaderState();
    setScrollProgress();
    setFloatingCta();
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

const cursorDot = document.querySelector(".cursor-dot");

if (glow) {
  const trailPool = [];
  const TRAIL_COUNT = 8;

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const dot = document.createElement("div");
    dot.classList.add("cursor-trail");
    dot.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);
    trailPool.push({ el: dot, x: 0, y: 0 });
  }

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      glow.style.opacity = "1";
      glow.style.left = `${mouseX}px`;
      glow.style.top = `${mouseY}px`;

      if (cursorDot) {
        cursorDot.classList.add("active");
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
      }
    },
    { passive: true },
  );

  /* Smooth trail following cursor */
  const animateTrail = () => {
    let prevX = mouseX;
    let prevY = mouseY;

    trailPool.forEach((dot, i) => {
      const speed = 0.3 - i * 0.025;
      dot.x += (prevX - dot.x) * speed;
      dot.y += (prevY - dot.y) * speed;
      dot.el.style.left = `${dot.x}px`;
      dot.el.style.top = `${dot.y}px`;
      dot.el.style.opacity = String(0.5 - i * 0.06);
      dot.el.style.width = `${Math.max(2, 5 - i * 0.4)}px`;
      dot.el.style.height = dot.el.style.width;
      prevX = dot.x;
      prevY = dot.y;
    });

    if (!reduceMotion.matches) requestAnimationFrame(animateTrail);
  };

  if (!reduceMotion.matches) requestAnimationFrame(animateTrail);

  /* Cursor dot grows when hovering interactive elements */
  const hoverTargets = document.querySelectorAll(
    "a, button, .service-card, .pricing-card, .photo-card, .est-option",
  );

  hoverTargets.forEach((el) => {
    el.addEventListener("pointerenter", () =>
      cursorDot?.classList.add("hovering"),
    );
    el.addEventListener("pointerleave", () =>
      cursorDot?.classList.remove("hovering"),
    );
  });
}

/* Magnetic tilt on cards */
if (!reduceMotion.matches) {
  const tiltCards = document.querySelectorAll(".service-card, .pricing-card");

  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = y * -8;
      const tiltY = x * 8;

      card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
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

const multiStepForm = document.querySelector("[data-multi-step-form]");

if (multiStepForm) {
  const steps = Array.from(multiStepForm.querySelectorAll("[data-form-step]"));
  const prevButton = multiStepForm.querySelector("[data-step-prev]");
  const nextButton = multiStepForm.querySelector("[data-step-next]");
  const submitButton = multiStepForm.querySelector("[data-step-submit]");
  const currentStepText = multiStepForm.querySelector("[data-current-step]");
  const progressBar = multiStepForm.querySelector("[data-progress-bar]");
  const statusMessage = multiStepForm.querySelector("[data-form-status]");
  let currentStep = 0;

  const updateFormStep = () => {
    const total = steps.length;

    steps.forEach((step, index) => {
      const isActive = index === currentStep;
      step.hidden = !isActive;
      step.classList.toggle("active", isActive);
    });

    if (currentStepText) {
      currentStepText.textContent = String(currentStep + 1);
    }

    if (progressBar) {
      const progress = ((currentStep + 1) / total) * 100;
      progressBar.style.width = `${progress}%`;
    }

    if (prevButton) {
      prevButton.hidden = currentStep === 0;
    }

    if (nextButton) {
      nextButton.hidden = currentStep === total - 1;
    }

    if (submitButton) {
      submitButton.hidden = currentStep !== total - 1;
    }
  };

  const validateCurrentStep = () => {
    const activeFields =
      steps[currentStep]?.querySelectorAll("input, select, textarea") || [];

    for (const field of activeFields) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }

    return true;
  };

  nextButton?.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    currentStep = Math.min(currentStep + 1, steps.length - 1);
    updateFormStep();
  });

  prevButton?.addEventListener("click", () => {
    currentStep = Math.max(currentStep - 1, 0);
    updateFormStep();
  });

  multiStepForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateCurrentStep()) return;

    if (window.location.protocol === "file:") {
      if (statusMessage) {
        statusMessage.textContent =
          "FormSubmit ne fonctionne pas en ouvrant le fichier HTML directement. Ouvrez le site via un serveur local (ex: Live Server), puis réessayez.";
        statusMessage.classList.remove("success");
        statusMessage.classList.add("error");
      }
      return;
    }

    if (statusMessage) {
      statusMessage.textContent = "Envoi en cours...";
      statusMessage.classList.remove("success", "error");
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const formData = new FormData(multiStepForm);
      const response = await fetch(multiStepForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json().catch(() => null);

      if (
        !response.ok ||
        result?.success === "false" ||
        result?.success === false
      ) {
        throw new Error(result?.message || "Form submission failed");
      }

      if (statusMessage) {
        statusMessage.textContent =
          "Merci. Votre demande a été envoyée avec succès. Nous revenons vers vous rapidement.";
        statusMessage.classList.remove("error");
        statusMessage.classList.add("success");
      }

      multiStepForm.reset();
      currentStep = 0;
      updateFormStep();
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "";

      if (statusMessage) {
        statusMessage.textContent = /web server/i.test(errorText)
          ? "FormSubmit nécessite un serveur web. Ouvrez le site via un serveur local (pas en file://), puis réessayez."
          : "Une erreur est survenue pendant l'envoi. Merci de réessayer ou d'écrire à contact@weareelitech.com.";
        statusMessage.classList.remove("success");
        statusMessage.classList.add("error");
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });

  updateFormStep();
}

/* ── Interactive Cost Estimator ── */

const estForm = document.querySelector("[data-estimator-form]");

if (estForm) {
  const estSteps = Array.from(estForm.querySelectorAll("[data-est-step]"));
  const questionSteps = estSteps.filter((s) => s.dataset.estStep !== "result");
  const resultStep = estForm.querySelector('[data-est-step="result"]');
  const prevBtn = estForm.querySelector("[data-est-prev]");
  const nextBtn = estForm.querySelector("[data-est-next]");
  const submitBtn = estForm.querySelector("[data-est-submit]");
  const stepText = estForm.querySelector("[data-est-current-step]");
  const progressBar = estForm.querySelector("[data-est-progress-bar]");
  const statusEl = estForm.querySelector("[data-est-status]");
  const resultRange = estForm.querySelector("[data-est-result-range]");
  const actionsEl = estForm.querySelector(".est-actions");
  let estCurrent = 0;
  const totalQuestions = questionSteps.length;

  /* ─ Pricing logic (easily editable) ─ */
  const PRICING = {
    type: {
      "site-vitrine": 1200,
      "site-ecommerce": 3000,
      "application-web": 4000,
      "application-mobile": 5000,
      plateforme: 7000,
      "ia-automatisation": 6000,
    },
    volume: { "1-5": 0, "6-15": 1500, "16-plus": 4000 },
    design: { basique: 0, premium: 1500, "sur-mesure": 3500 },
    delai: { urgent: 1500, normal: 0, flexible: -500 },
    options: {
      seo: 800,
      ia: 2500,
      automatisation: 2000,
      maintenance: 1200,
      multilingue: 1000,
      analytics: 600,
    },
  };

  const calcEstimate = () => {
    const type =
      estForm.querySelector('input[name="est_type"]:checked')?.value || "";
    const volume =
      estForm.querySelector('input[name="est_volume"]:checked')?.value || "";
    const design =
      estForm.querySelector('input[name="est_design"]:checked')?.value || "";
    const delai =
      estForm.querySelector('input[name="est_delai"]:checked')?.value || "";
    const opts = Array.from(
      estForm.querySelectorAll('input[name="est_options"]:checked'),
    ).map((c) => c.value);

    let base =
      (PRICING.type[type] || 0) +
      (PRICING.volume[volume] || 0) +
      (PRICING.design[design] || 0) +
      (PRICING.delai[delai] || 0);
    opts.forEach((o) => (base += PRICING.options[o] || 0));

    const low = Math.max(1000, Math.round((base * 0.85) / 100) * 100);
    const high = Math.round((base * 1.25) / 100) * 100;

    return `${low.toLocaleString("fr-FR")}€ – ${high.toLocaleString("fr-FR")}€`;
  };

  const updateEstStep = (showResult) => {
    estSteps.forEach((s) => {
      s.hidden = true;
      s.classList.remove("active");
    });

    if (showResult) {
      resultStep.hidden = false;
      resultStep.classList.add("active");
      actionsEl.hidden = true;
      if (stepText) stepText.textContent = "✓";
      if (progressBar) progressBar.style.width = "100%";
      return;
    }

    const active = questionSteps[estCurrent];
    if (active) {
      active.hidden = false;
      active.classList.add("active");
    }

    actionsEl.hidden = false;

    if (stepText) stepText.textContent = String(estCurrent + 1);
    if (progressBar)
      progressBar.style.width = `${((estCurrent + 1) / totalQuestions) * 100}%`;

    if (prevBtn) prevBtn.hidden = estCurrent === 0;
    if (nextBtn) nextBtn.hidden = estCurrent === totalQuestions - 1;
    if (submitBtn) submitBtn.hidden = estCurrent !== totalQuestions - 1;
  };

  const validateEstStep = () => {
    const step = questionSteps[estCurrent];
    const radios = step.querySelectorAll('input[type="radio"]');
    const texts = step.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="tel"]',
    );

    if (radios.length) {
      const name = radios[0].name;
      if (!estForm.querySelector(`input[name="${name}"]:checked`)) {
        radios[0].setCustomValidity("Veuillez sélectionner une option.");
        radios[0].reportValidity();
        radios[0].setCustomValidity("");
        return false;
      }
    }

    for (const f of texts) {
      if (!f.checkValidity()) {
        f.reportValidity();
        return false;
      }
    }

    return true;
  };

  nextBtn?.addEventListener("click", () => {
    if (!validateEstStep()) return;
    estCurrent = Math.min(estCurrent + 1, totalQuestions - 1);
    updateEstStep(false);
  });

  prevBtn?.addEventListener("click", () => {
    estCurrent = Math.max(estCurrent - 1, 0);
    updateEstStep(false);
  });

  estForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateEstStep()) return;

    if (window.location.protocol === "file:") {
      if (statusEl) {
        statusEl.textContent =
          "FormSubmit nécessite un serveur web. Ouvrez le site via un serveur local, puis réessayez.";
        statusEl.classList.add("error");
      }
      return;
    }

    if (statusEl) {
      statusEl.textContent = "Envoi en cours...";
      statusEl.classList.remove("success", "error");
    }
    if (submitBtn) submitBtn.disabled = true;

    const estimate = calcEstimate();

    try {
      const formData = new FormData(estForm);
      formData.append("estimation", estimate);

      const response = await fetch(
        "https://formsubmit.co/ajax/contact@weareelitech.com",
        {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        },
      );

      const result = await response.json().catch(() => null);

      if (
        !response.ok ||
        result?.success === "false" ||
        result?.success === false
      ) {
        throw new Error(result?.message || "Submission failed");
      }

      if (resultRange) resultRange.textContent = estimate;
      if (statusEl) {
        statusEl.textContent = "";
        statusEl.classList.remove("error");
      }

      updateEstStep(true);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      if (statusEl) {
        statusEl.textContent = /web server/i.test(msg)
          ? "FormSubmit nécessite un serveur web."
          : "Une erreur est survenue. Merci de réessayer ou d'écrire à contact@weareelitech.com.";
        statusEl.classList.add("error");
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  const resetEstimator = () => {
    estForm.reset();
    estCurrent = 0;
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.classList.remove("success", "error");
    }
    updateEstStep(false);
  };

  const resetBtn = estForm.querySelector("[data-est-reset]");
  resetBtn?.addEventListener("click", resetEstimator);

  document.querySelectorAll(".pricing-cta").forEach((cta) => {
    cta.addEventListener("click", () => {
      resetEstimator();
    });
  });

  updateEstStep(false);
}
