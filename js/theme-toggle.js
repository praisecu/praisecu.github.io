(() => {
  "use strict";

  const storageKey = "praise-theme";
  const root = document.documentElement;

  function normalizeTheme(value) {
    return value === "dark" ? "dark" : "light";
  }

  function readSavedTheme() {
    try {
      return normalizeTheme(
        window.localStorage.getItem(storageKey)
      );
    } catch {
      return "light";
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch {
      /*
       * The toggle still works for the current page when
       * browser storage is unavailable.
       */
    }
  }

  function updateThemeColor(theme) {
    const themeColor = document.querySelector(
      'meta[name="theme-color"]'
    );

    if (!themeColor) {
      return;
    }

    themeColor.setAttribute(
      "content",
      theme === "dark" ? "#111207" : "#ffffff"
    );
  }

  function updateButtons(theme) {
    const isDark = theme === "dark";
    const nextMode = isDark ? "light" : "dark";
    const label = `Switch to ${nextMode} mode`;

    document
      .querySelectorAll("[data-theme-toggle]")
      .forEach((button) => {
        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
        button.setAttribute(
          "aria-pressed",
          String(isDark)
        );

        const text = button.querySelector(
          ".theme-toggle__label"
        );

        if (text) {
          text.textContent = label;
        }
      });
  }

  function applyTheme(theme, persist = true) {
    const normalized = normalizeTheme(theme);

    root.dataset.theme = normalized;
    root.style.colorScheme = normalized;

    updateThemeColor(normalized);
    updateButtons(normalized);

    if (persist) {
      saveTheme(normalized);
    }
  }

  function toggleTheme() {
    const current = normalizeTheme(root.dataset.theme);

    applyTheme(
      current === "dark" ? "light" : "dark"
    );
  }

  function initializeThemeToggle() {
    const initialTheme =
      root.dataset.theme || readSavedTheme();

    applyTheme(initialTheme, false);

    document
      .querySelectorAll("[data-theme-toggle]")
      .forEach((button) => {
        button.addEventListener("click", toggleTheme);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeThemeToggle,
      { once: true }
    );
  } else {
    initializeThemeToggle();
  }

  /*
   * Keep multiple tabs synchronized when the preference
   * changes in another tab.
   */
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) {
      applyTheme(event.newValue, false);
    }
  });
})();
