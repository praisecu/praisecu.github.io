document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector("[data-home-carousel]");

  if (!carousel) {
    return;
  }

  const slides = Array.from(
    carousel.querySelectorAll("[data-home-slide]")
  );

  const indicators = Array.from(
    carousel.querySelectorAll("[data-carousel-indicator]")
  );

  const previousButton = carousel.querySelector(
    "[data-carousel-previous]"
  );

  const nextButton = carousel.querySelector(
    "[data-carousel-next]"
  );

  if (slides.length < 2) {
    return;
  }

  let currentIndex = 0;
  let intervalId = null;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function showSlide(index) {
    currentIndex = (
      index + slides.length
    ) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;

      slide.classList.toggle("is-active", isActive);
      slide.hidden = !isActive;
      slide.setAttribute(
        "aria-hidden",
        String(!isActive)
      );
    });

    indicators.forEach((indicator, indicatorIndex) => {
      const isActive = indicatorIndex === currentIndex;

      indicator.classList.toggle("is-active", isActive);
      indicator.setAttribute(
        "aria-current",
        String(isActive)
      );
    });
  }

  function showPreviousSlide() {
    showSlide(currentIndex - 1);
  }

  function showNextSlide() {
    showSlide(currentIndex + 1);
  }

  function stopAutomaticRotation() {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  function startAutomaticRotation() {
    stopAutomaticRotation();

    if (prefersReducedMotion || document.hidden) {
      return;
    }

    intervalId = window.setInterval(
      showNextSlide,
      6500
    );
  }

  previousButton?.addEventListener("click", () => {
    showPreviousSlide();
    startAutomaticRotation();
  });

  nextButton?.addEventListener("click", () => {
    showNextSlide();
    startAutomaticRotation();
  });

  indicators.forEach((indicator) => {
    indicator.addEventListener("click", () => {
      const slideIndex = Number(
        indicator.dataset.slideIndex
      );

      if (Number.isInteger(slideIndex)) {
        showSlide(slideIndex);
        startAutomaticRotation();
      }
    });
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousSlide();
      startAutomaticRotation();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextSlide();
      startAutomaticRotation();
    }
  });

  carousel.addEventListener(
    "pointerenter",
    stopAutomaticRotation
  );

  carousel.addEventListener(
    "pointerleave",
    startAutomaticRotation
  );

  carousel.addEventListener(
    "focusin",
    stopAutomaticRotation
  );

  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      startAutomaticRotation();
    }
  });

  document.addEventListener(
    "visibilitychange",
    startAutomaticRotation
  );

  showSlide(0);
  startAutomaticRotation();
});