document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".modern-header");

  if (!header) {
    return;
  }

  const menuButton = header.querySelector(
    ".modern-header__menu-button"
  );

  const navigation = header.querySelector(
    ".modern-header__navigation"
  );

  const dropdown = header.querySelector(
    ".modern-header__dropdown"
  );

  const dropdownButton = header.querySelector(
    ".modern-header__dropdown-button"
  );

  function closeDropdown() {
    if (!dropdown || !dropdownButton) {
      return;
    }

    dropdown.classList.remove("is-open");
    dropdownButton.setAttribute("aria-expanded", "false");
  }

  function closeMenu() {
    if (!menuButton || !navigation) {
      return;
    }

    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");

    closeDropdown();
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuButton.setAttribute(
        "aria-label",
        isOpen
          ? "Close navigation menu"
          : "Open navigation menu"
      );

      if (!isOpen) {
        closeDropdown();
      }
    });
  }

  if (dropdown && dropdownButton) {
    dropdownButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const isOpen = dropdown.classList.toggle("is-open");

      dropdownButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });
  }

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();

      if (menuButton) {
        menuButton.focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
      closeMenu();
    }
  });
});
