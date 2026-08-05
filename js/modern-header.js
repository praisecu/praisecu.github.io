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
    /*
     * Desktop uses hover and keyboard focus.
     * Mobile uses click/tap.
     */
    if (window.innerWidth > 900) {
      return;
    }

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
  const mobileMoreButton = document.querySelector(
    ".mobile-bottom-nav__more"
  );

  const mobileMoreMenu = document.querySelector(
    ".mobile-more-menu"
  );

  const mobileMoreBackdrop = document.querySelector(
    ".mobile-more-menu__backdrop"
  );

  const mobileMoreClose = document.querySelector(
    ".mobile-more-menu__close"
  );

  function closeMobileMoreMenu() {
    if (!mobileMoreButton || !mobileMoreMenu) {
      return;
    }

    mobileMoreMenu.classList.remove("is-open");
    mobileMoreMenu.setAttribute("aria-hidden", "true");
    mobileMoreButton.setAttribute("aria-expanded", "false");
  }

  function openMobileMoreMenu() {
    if (!mobileMoreButton || !mobileMoreMenu) {
      return;
    }

    mobileMoreMenu.classList.add("is-open");
    mobileMoreMenu.setAttribute("aria-hidden", "false");
    mobileMoreButton.setAttribute("aria-expanded", "true");

    mobileMoreClose?.focus();
  }

  mobileMoreButton?.addEventListener("click", () => {
    const isOpen =
      mobileMoreMenu?.classList.contains("is-open");

    if (isOpen) {
      closeMobileMoreMenu();
    } else {
      openMobileMoreMenu();
    }
  });

  mobileMoreBackdrop?.addEventListener(
    "click",
    closeMobileMoreMenu
  );

  mobileMoreClose?.addEventListener(
    "click",
    closeMobileMoreMenu
  );

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      mobileMoreMenu?.classList.contains("is-open")
    ) {
      closeMobileMoreMenu();
      mobileMoreButton?.focus();
    }
  });
});
