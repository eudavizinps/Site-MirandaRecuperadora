document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
  const track = carousel.querySelector("[data-track]");
  const previous = carousel.querySelector("[data-prev]");
  const next = carousel.querySelector("[data-next]");
  const status = carousel.querySelector("[data-status]");
  let current = 0;
  let timer;

  const visibleCards = () => {
    const desktop = Number(carousel.dataset.visibleDesktop || 2);
    const tablet = Number(carousel.dataset.visibleTablet || desktop);
    const mobile = Number(carousel.dataset.visibleMobile || 1);

    if (window.matchMedia("(min-width: 1041px)").matches) return desktop;
    if (window.matchMedia("(min-width: 760px)").matches) return tablet;
    return mobile;
  };
  const maxIndex = () => Math.max(0, slides.length - visibleCards());
  const cardStep = () => {
    const gap = Number.parseFloat(window.getComputedStyle(track).gap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  };

  const render = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === current);
    });

    const visible = visibleCards();
    const maximum = maxIndex();
    current = Math.min(current, maximum);
    if (status) status.textContent = visible > 1 ? `${current + 1}-${Math.min(current + visible, slides.length)} / ${slides.length}` : `${current + 1} / ${slides.length}`;
    if (previous) previous.disabled = maximum === 0;
    if (next) next.disabled = maximum === 0;
    track.style.transform = `translateX(-${current * cardStep()}px)`;
  };

  const show = (index) => {
    const maximum = maxIndex();
    current = maximum === 0 ? 0 : (index + maximum + 1) % (maximum + 1);
    render();
  };

  if (previous) previous.addEventListener("click", () => {
    stopAutoPlay();
    show(current - 1);
    startAutoPlay();
  });
  if (next) next.addEventListener("click", () => {
    stopAutoPlay();
    show(current + 1);
    startAutoPlay();
  });

  const startAutoPlay = () => {
    if (maxIndex() === 0) return;
    timer = window.setInterval(() => show(current + 1), 7000);
  };

  const stopAutoPlay = () => window.clearInterval(timer);
  carousel.addEventListener("mouseenter", stopAutoPlay);
  carousel.addEventListener("mouseleave", startAutoPlay);
  carousel.addEventListener("focusin", stopAutoPlay);
  carousel.addEventListener("focusout", startAutoPlay);
  window.addEventListener("resize", render);

  if (carousel.dataset.drag === "true") {
    let startX = 0;
    let deltaX = 0;
    let dragging = false;

    carousel.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest("button")) return;
      stopAutoPlay();
      startX = event.clientX;
      deltaX = 0;
      dragging = true;
      track.style.transition = "none";
      carousel.classList.add("is-dragging");
      carousel.setPointerCapture(event.pointerId);
    });

    carousel.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      deltaX = event.clientX - startX;
      track.style.transform = `translateX(${-current * cardStep() + deltaX}px)`;
    });

    const finishDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "";
      carousel.classList.remove("is-dragging");
      if (carousel.hasPointerCapture(event.pointerId)) carousel.releasePointerCapture(event.pointerId);

      const threshold = Math.max(42, cardStep() * 0.12);
      if (deltaX <= -threshold) show(current + 1);
      else if (deltaX >= threshold) show(current - 1);
      else render();
      startAutoPlay();
    };

    carousel.addEventListener("pointerup", finishDrag);
    carousel.addEventListener("pointercancel", finishDrag);
  }

  render();
  startAutoPlay();
});

const header = document.querySelector(".site-header");

if (header) {
  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

const animatedElements = document.querySelectorAll(
  ".section-heading, .metric-grid article, .flow-item, .presence-grid > *, .partner-card, .testimonial-card, .site-footer > *"
);

if (animatedElements.length) {
  animatedElements.forEach((element, index) => {
    element.classList.add("reveal", `reveal-delay-${(index % 4)}`);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px" }
    );

    animatedElements.forEach((element) => observer.observe(element));
  } else {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
  }
}

const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileMenu = document.querySelector("[data-mobile-menu]");

if (menuToggle && mobileMenu) {
  const setMenu = (open) => {
    menuToggle.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
  };

  menuToggle.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  mobileMenu.querySelectorAll("[data-menu-link]").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 1041px)").matches) setMenu(false);
  });
}
