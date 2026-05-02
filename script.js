/**
 * RANGA IMAGES – Luxury Photography Studio
 * script.js  |  Vanilla JS only, no libraries
 */

"use strict";

/* ================================================================
  UTILS
  ================================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ================================================================
  1. LOADING SCREEN
  ================================================================ */
(function initLoader() {
  const loader = $("#loader");
  if (!loader) return;

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("hidden");
      document.body.style.overflow = "";
    }, 1800); // let progress bar finish
  });

  // Prevent scroll while loading
  document.body.style.overflow = "hidden";
})();

/* ================================================================
  2. CUSTOM CURSOR
  ================================================================ */
(function initCursor() {
  const dot = $("#cursorDot");
  const ring = $("#cursorRing");
  if (!dot || !ring) return;

  let mx = -200,
    my = -200; // off-screen initially
  let rx = -200,
    ry = -200;

  // Track real mouse position
  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + "px";
    dot.style.top = my + "px";
  });

  // Smooth ring with RAF
  function animateCursor() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Scale on clickable elements
  document.addEventListener("mouseover", (e) => {
    if (
      e.target.closest('a, button, [role="button"], .filter-btn, .p-view-btn')
    ) {
      ring.style.width = "52px";
      ring.style.height = "52px";
      ring.style.borderColor = "var(--clr-gold)";
      ring.style.background = "rgba(201,168,76,.08)";
      dot.style.transform = "translate(-50%,-50%) scale(1.5)";
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (
      e.target.closest('a, button, [role="button"], .filter-btn, .p-view-btn')
    ) {
      ring.style.width = "36px";
      ring.style.height = "36px";
      ring.style.borderColor = "rgba(201,168,76,.6)";
      ring.style.background = "transparent";
      dot.style.transform = "translate(-50%,-50%) scale(1)";
    }
  });

  document.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
    ring.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    dot.style.opacity = "1";
    ring.style.opacity = "1";
  });
})();

/* ================================================================
  3. NAVBAR – scroll behaviour + active link + mobile menu
  ================================================================ */
(function initNavbar() {
  const navbar = $("#navbar");
  const hamburger = $("#hamburger");
  const navMenu = $("#navMenu");
  const navLinks = $$(".nav-link");

  if (!navbar) return;

  // Scroll class
  function handleScroll() {
    navbar.classList.toggle("scrolled", window.scrollY > 60);

    // Back-to-top visibility
    const btt = $("#backToTop");
    if (btt) btt.classList.toggle("visible", window.scrollY > 500);
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // Mobile hamburger
  hamburger &&
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navMenu.classList.toggle("open");
      document.body.style.overflow = navMenu.classList.contains("open")
        ? "hidden"
        : "";
    });

  // Close menu on link click
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      hamburger && hamburger.classList.remove("open");
      navMenu && navMenu.classList.remove("open");
      document.body.style.overflow = "";
    });
  });

  // Active section highlighting
  const sections = $$("section[id]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id,
            );
          });
        }
      });
    },
    { threshold: 0.35 },
  );

  sections.forEach((s) => observer.observe(s));
})();

/* ================================================================
  4. HERO PARALLAX
  ================================================================ */
(function initParallax() {
  const heroBg = $("#heroBg");
  if (!heroBg) return;

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.35}px)`;
    },
    { passive: true },
  );
})();

/* ================================================================
  5. PARTICLE SYSTEM (canvas)
  ================================================================ */
(function initParticles() {
  const canvas = $("#particlesCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W,
    H,
    particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const GOLD = "rgba(201,168,76,";

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.r = Math.random() * 1.4 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -(Math.random() * 0.5 + 0.1);
      this.a = 0;
      this.maxA = Math.random() * 0.4 + 0.05;
      this.life = 0;
      this.maxLife = Math.random() * 280 + 140;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      const progress = this.life / this.maxLife;
      this.a =
        progress < 0.2
          ? (progress / 0.2) * this.maxA
          : progress > 0.8
            ? ((1 - progress) / 0.2) * this.maxA
            : this.maxA;
      if (this.life >= this.maxLife) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = GOLD + this.a + ")";
      ctx.fill();
    }
  }

  // Spawn particles
  const COUNT = Math.min(80, Math.floor((W * H) / 12000));
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ================================================================
  6. SCROLL REVEAL (Intersection Observer)
  ================================================================ */
(function initScrollReveal() {
  const revealEls = $$(".reveal-up, .reveal-left, .reveal-right, .reveal-fade");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  revealEls.forEach((el) => io.observe(el));
})();

/* ================================================================
  7. ANIMATED COUNTERS
  ================================================================ */
(function initCounters() {
  const counters = $$(".stat-num");
  if (!counters.length) return;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(easeOut(progress) * target);
      el.textContent = value.toLocaleString("en-IN");
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((el) => io.observe(el));
})();

/* ================================================================
  8. PORTFOLIO FILTER + LIGHTBOX
  ================================================================ */
(function initPortfolio() {
  const filterBtns = $$(".filter-btn");
  const items = $$(".p-item");

  // ── Filter ───────────────────────────────────────────────────
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      items.forEach((item) => {
        const match = filter === "all" || item.dataset.cat === filter;
        if (match) {
          item.classList.remove("hidden");
          item.classList.add("filtering");
          setTimeout(() => item.classList.remove("filtering"), 450);
        } else {
          item.classList.add("hidden");
        }
      });
    });
  });

  // ── Lightbox ─────────────────────────────────────────────────
  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbTitle = $("#lbTitle");
  const lbCat = $("#lbCat");
  const lbClose = $("#lbClose");
  const lbBd = $("#lbBackdrop");
  const lbPrev = $("#lbPrev");
  const lbNext = $("#lbNext");
  const lbSpinner = $("#lbSpinner");
  if (!lightbox) return;

  let galleryItems = []; // visible items at open time
  let currentIndex = 0;

  function openLightbox(btn) {
    // Build gallery from currently visible items
    galleryItems = $$(".p-item:not(.hidden) .p-view-btn");
    currentIndex = galleryItems.indexOf(btn);
    showImage(btn);
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function showImage(btn) {
    const src = btn.dataset.src;
    const title = btn.dataset.title;
    const cat = btn.dataset.cat;

    lbSpinner.classList.add("active");
    lbImg.style.opacity = "0";

    lbTitle.textContent = title;
    lbCat.textContent = cat;

    const tmpImg = new Image();
    tmpImg.onload = () => {
      lbImg.src = src;
      lbImg.alt = title;
      lbImg.style.opacity = "1";
      lbSpinner.classList.remove("active");
    };
    tmpImg.onerror = () => {
      lbImg.src = src;
      lbImg.style.opacity = "1";
      lbSpinner.classList.remove("active");
    };
    tmpImg.src = src;
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  function navigate(dir) {
    currentIndex =
      (currentIndex + dir + galleryItems.length) % galleryItems.length;
    showImage(galleryItems[currentIndex]);
  }

  // Event delegation on grid
  $("#portfolioGrid") &&
    $("#portfolioGrid").addEventListener("click", (e) => {
      const btn = e.target.closest(".p-view-btn");
      if (btn) openLightbox(btn);
    });

  lbClose && lbClose.addEventListener("click", closeLightbox);
  lbBd && lbBd.addEventListener("click", closeLightbox);
  lbPrev && lbPrev.addEventListener("click", () => navigate(-1));
  lbNext && lbNext.addEventListener("click", () => navigate(1));

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") navigate(-1);
    if (e.key === "ArrowRight") navigate(1);
  });

  // Touch swipe support
  let touchStartX = 0;
  lightbox.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
  lightbox.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
  });
})();

/* ================================================================
  9. TESTIMONIALS SLIDER
  ================================================================ */
(function initTestimonials() {
  const track = $("#testiTrack");
  const slides = $$(".testi-slide");
  const prevBtn = $("#testiPrev");
  const nextBtn = $("#testiNext");
  const dotsWrap = $("#testiDots");
  if (!track || !slides.length) return;

  let current = 0;
  let autoPlay = null;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "testi-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap && dotsWrap.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    $$(".testi-dot").forEach((d, i) =>
      d.classList.toggle("active", i === current),
    );
  }

  prevBtn &&
    prevBtn.addEventListener("click", () => {
      goTo(current - 1);
      resetAuto();
    });
  nextBtn &&
    nextBtn.addEventListener("click", () => {
      goTo(current + 1);
      resetAuto();
    });

  function startAuto() {
    autoPlay = setInterval(() => goTo(current + 1), 5500);
  }
  function resetAuto() {
    clearInterval(autoPlay);
    startAuto();
  }
  startAuto();

  // Pause on hover
  const slider = $("#testiSlider");
  slider &&
    slider.addEventListener("mouseenter", () => clearInterval(autoPlay));
  slider && slider.addEventListener("mouseleave", () => startAuto());

  // Touch swipe
  let tx = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      tx = e.touches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) {
      goTo(current + (dx < 0 ? 1 : -1));
      resetAuto();
    }
  });
})();

/* ================================================================
  10. BOOKING FORM VALIDATION
  ================================================================ */
(function initBookingForm() {
  const form = $("#bookingForm");
  const submitBtn = $("#submitBtn");
  const success = $("#formSuccess");
  if (!form) return;

  // Real-time validation helpers
  function setError(fieldId, errId, msg) {
    const field = $("#" + fieldId);
    const err = $("#" + errId);
    if (!field || !err) return;
    err.textContent = msg;
    field.closest(".form-group").classList.toggle("has-error", !!msg);
  }

  function clearError(fieldId, errId) {
    setError(fieldId, errId, "");
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
  }
  function validatePhone(val) {
    return /^[+]?[\d\s\-().]{7,15}$/.test(val.trim());
  }

  // Blur-time validation
  $("#fname") &&
    $("#fname").addEventListener("blur", () => {
      const v = $("#fname").value.trim();
      setError(
        "fname",
        "fnameErr",
        v.length < 2 ? "Please enter your full name." : "",
      );
    });
  $("#femail") &&
    $("#femail").addEventListener("blur", () => {
      const v = $("#femail").value.trim();
      setError(
        "femail",
        "femailErr",
        !validateEmail(v) ? "Please enter a valid email address." : "",
      );
    });
  $("#fphone") &&
    $("#fphone").addEventListener("blur", () => {
      const v = $("#fphone").value.trim();
      setError(
        "fphone",
        "fphoneErr",
        !validatePhone(v) ? "Please enter a valid phone number." : "",
      );
    });
  $("#ftype") &&
    $("#ftype").addEventListener("change", () => {
      const v = $("#ftype").value;
      setError("ftype", "ftypeErr", !v ? "Please select an event type." : "");
      // keep select label gold when selected
      const lbl = $(".select-lbl");
      if (lbl) lbl.classList.toggle("gold", !!v);
    });
  $("#fmsg") &&
    $("#fmsg").addEventListener("blur", () => {
      const v = $("#fmsg").value.trim();
      setError(
        "fmsg",
        "fmsgErr",
        v.length < 10 ? "Please tell us a bit about your vision." : "",
      );
    });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = $("#fname") ? $("#fname").value.trim() : "";
    const email = $("#femail") ? $("#femail").value.trim() : "";
    const phone = $("#fphone") ? $("#fphone").value.trim() : "";
    const type = $("#ftype") ? $("#ftype").value : "";
    const msg = $("#fmsg") ? $("#fmsg").value.trim() : "";

    let valid = true;

    if (name.length < 2) {
      setError("fname", "fnameErr", "Please enter your full name.");
      valid = false;
    } else clearError("fname", "fnameErr");

    if (!validateEmail(email)) {
      setError("femail", "femailErr", "Please enter a valid email address.");
      valid = false;
    } else clearError("femail", "femailErr");

    if (!validatePhone(phone)) {
      setError("fphone", "fphoneErr", "Please enter a valid phone number.");
      valid = false;
    } else clearError("fphone", "fphoneErr");

    if (!type) {
      setError("ftype", "ftypeErr", "Please select an event type.");
      valid = false;
    } else clearError("ftype", "ftypeErr");

    if (msg.length < 10) {
      setError("fmsg", "fmsgErr", "Please tell us a bit about your vision.");
      valid = false;
    } else clearError("fmsg", "fmsgErr");

    if (!valid) {
      // Scroll to first error
      const firstErr = form.querySelector(".has-error");
      if (firstErr)
        firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Simulate submission
    submitBtn.disabled = true;
    submitBtn.querySelector("span").textContent = "Sending…";

    setTimeout(() => {
      form.reset();
      $$(".ferr").forEach((el) => (el.textContent = ""));
      $$(".form-group").forEach((el) => el.classList.remove("has-error"));
      submitBtn.disabled = false;
      submitBtn.querySelector("span").textContent = "Send Inquiry";

      if (success) {
        success.classList.add("show");
        setTimeout(() => success.classList.remove("show"), 5000);
      }
    }, 1400);
  });
})();

/* ================================================================
  11. NEWSLETTER FORM
  ================================================================ */
(function initNewsletter() {
  const form = $("#newsletterForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const btn = form.querySelector("button");
    if (!input || !btn) return;

    const orig = btn.textContent;
    btn.textContent = "✓";
    btn.style.background = "#4caf50";
    input.value = "";

    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = "";
    }, 3000);
  });
})();

/* ================================================================
  12. SMOOTH SCROLL (for browsers that don't support CSS)
  ================================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const navH = $("#navbar") ? $("#navbar").offsetHeight : 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();

/* ================================================================
  13. BACK TO TOP
  ================================================================ */
(function initBackToTop() {
  const btn = $("#backToTop");
  if (!btn) return;
  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
})();

/* ================================================================
  14. MICRO-INTERACTIONS – service cards tilt on desktop
  ================================================================ */
(function initCardTilt() {
  if (window.matchMedia("(hover: none)").matches) return; // skip touch devices

  $$(".svc-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(800px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();

/* ================================================================
  15. PAGE TRANSITION FADE
  ================================================================ */
(function initPageFade() {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity .5s ease";

  window.addEventListener("load", () => {
    setTimeout(() => {
      document.body.style.opacity = "1";
    }, 50);
  });
})();

/* ================================================================
  16. SELECT LABEL GOLD STATE (initial load)
  ================================================================ */
(function initSelectLabel() {
  const sel = $("#ftype");
  const lbl = $(".select-lbl");
  if (!sel || !lbl) return;
  sel.addEventListener("change", () => {
    lbl.classList.toggle("gold", sel.value !== "");
  });
})();
