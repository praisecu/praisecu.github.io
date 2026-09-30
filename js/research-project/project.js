/*
 * Research project pages (src/research/): light/dark toggle, carousels,
 * sliders, BibTeX copy and equations. Loaded at the end of <body> by
 * layouts/research-project.njk.
 */
(function () {
  "use strict";

  /* ---- Light / dark toggle --------------------------------------------
   * Shares its storage key with js/theme-toggle.js, so a visitor's choice
   * carries across the whole site. With no saved choice these pages follow
   * the operating system setting. */
  var storageKey = "praise-theme";
  var root = document.documentElement;

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function currentTheme() {
    var theme = root.getAttribute("data-theme");
    if (theme === "light" || theme === "dark") return theme;
    return systemPrefersDark() ? "dark" : "light";
  }

  function updateThemeColor() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", currentTheme() === "dark" ? "#10110e" : "#ffffff");
  }

  document.querySelectorAll(".theme-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      updateThemeColor();
      try { localStorage.setItem(storageKey, next); } catch (error) { /* private mode etc. */ }
    });
  });
  updateThemeColor();

  /* Keep other open tabs of the site in step. */
  window.addEventListener("storage", function (event) {
    if (event.key === storageKey && (event.newValue === "light" || event.newValue === "dark")) {
      root.setAttribute("data-theme", event.newValue);
      updateThemeColor();
    }
  });

  /* ---- Results carousels (bulma-carousel) ------------------------------ */
  if (window.bulmaCarousel) {
    document.querySelectorAll(".carousel").forEach(function (el) {
      var n = parseInt(el.dataset.slides, 10) || 3;
      bulmaCarousel.attach(el, {
        slidesToScroll: 1,
        slidesToShow: n,
        loop: true,
        infinite: true,
        autoplay: false,
        breakpoints: [
          { changePoint: 480, slidesToShow: 1, slidesToScroll: 1 },
          { changePoint: 768, slidesToShow: Math.min(2, n), slidesToScroll: 1 },
          { changePoint: 1024, slidesToShow: n, slidesToScroll: 1 }
        ]
      });
    });
  }

  /* ---- Frame sliders ({% frameslider %}) ------------------------------- */
  document.querySelectorAll(".frame-slider").forEach(function (panel) {
    var dir = (panel.dataset.dir || "").replace(/\/$/, "");
    var count = parseInt(panel.dataset.frames, 10) || 0;
    var ext = panel.dataset.ext || "jpg";
    var pad = parseInt(panel.dataset.pad, 10) || 6;
    var first = parseInt(panel.dataset.start, 10) || 0;
    var wrapper = panel.querySelector(".interpolation-image-wrapper");
    var range = panel.querySelector(".frame-slider-range");
    if (!wrapper || !range || !count) return;

    var frames = [];
    for (var i = 0; i < count; i++) {
      var img = new Image();
      img.src = dir + "/" + String(first + i).padStart(pad, "0") + "." + ext;
      frames.push(img);
    }
    var shown = document.createElement("img");
    shown.alt = "Frame";
    shown.draggable = false;
    wrapper.innerHTML = "";
    wrapper.appendChild(shown);

    function show(index) { shown.src = frames[Math.max(0, Math.min(count - 1, index))].src; }
    range.max = count - 1;
    range.addEventListener("input", function () { show(parseInt(range.value, 10)); });
    show(0);
  });

  /* ---- Before/after comparison ({% compare %}) ------------------------- */
  document.querySelectorAll(".compare").forEach(function (el) {
    var range = el.querySelector(".compare-range");
    if (!range) return;
    function update() { el.style.setProperty("--pos", range.value + "%"); }
    range.addEventListener("input", update);
    update();
  });

  /* ---- BibTeX copy button --------------------------------------------- */
  document.querySelectorAll(".copy-bibtex").forEach(function (button) {
    button.addEventListener("click", function () {
      var code = document.getElementById(button.dataset.target);
      if (!code || !navigator.clipboard) return;
      navigator.clipboard.writeText(code.textContent).then(function () {
        var label = button.querySelector("span:last-child");
        var old = label.textContent;
        label.textContent = "Copied!";
        setTimeout(function () { label.textContent = old; }, 1500);
      });
    });
  });

  /* ---- Equations -------------------------------------------------------
   * eleventy.research.js turns $$...$$ into elements carrying the TeX in
   * data-tex; KaTeX (loaded with `defer` when a page sets math: true)
   * draws them once the page has parsed. */
  function renderMath() {
    if (!window.katex) return;
    document.querySelectorAll("[data-tex]").forEach(function (el) {
      katex.render(el.getAttribute("data-tex"), el, {
        displayMode: el.classList.contains("math-block"),
        throwOnError: false
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderMath);
  } else {
    renderMath();
  }

  /* ---- bulma-slider styling for range inputs --------------------------- */
  if (window.bulmaSlider) bulmaSlider.attach();
})();
