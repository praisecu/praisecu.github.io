(() => {
  "use strict";

  const DISMISS_KEY = "praise-pwa-install-dismissed-until";
  const DISMISS_DAYS = 14;

  let deferredInstallPrompt = null;
  let documentReady = false;

  function isInstalled() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function isIos() {
    const userAgent = window.navigator.userAgent;

    return (
      /iPhone|iPad|iPod/i.test(userAgent) ||
      (
        window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1
      )
    );
  }

  function getDismissedUntil() {
    try {
      return Number(
        window.localStorage.getItem(DISMISS_KEY)
      ) || 0;
    } catch {
      return 0;
    }
  }

  function hasBeenDismissed() {
    return getDismissedUntil() > Date.now();
  }

  function rememberDismissal() {
    const duration =
      DISMISS_DAYS * 24 * 60 * 60 * 1000;

    try {
      window.localStorage.setItem(
        DISMISS_KEY,
        String(Date.now() + duration)
      );
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }

  function getElements() {
    return {
      card: document.querySelector("#pwa-install"),
      message: document.querySelector(
        "#pwa-install-message"
      ),
      installButton: document.querySelector(
        "#pwa-install-button"
      ),
      closeButton: document.querySelector(
        "#pwa-install-close"
      )
    };
  }

  function hideInstallCard() {
    const { card } = getElements();

    if (card) {
      card.hidden = true;
    }
  }

  function showInstallCard(mode) {
    if (
      !documentReady ||
      isInstalled() ||
      hasBeenDismissed()
    ) {
      return;
    }

    const {
      card,
      message,
      installButton
    } = getElements();

    if (!card || !message || !installButton) {
      return;
    }

    if (mode === "ios") {
      message.textContent =
        "Use Share, then Add to Home Screen.";

      installButton.textContent = "Show steps";
      installButton.dataset.installMode = "ios";
    } else {
      message.textContent =
        "Add PRAISe Lab to this device.";

      installButton.textContent = "Install";
      installButton.dataset.installMode = "native";
    }

    card.hidden = false;
  }

  async function handleInstallClick() {
    const {
      message,
      installButton
    } = getElements();

    if (!message || !installButton) {
      return;
    }

    if (
      installButton.dataset.installMode === "ios"
    ) {
      message.textContent =
        "Tap Chrome's Share button, then choose " +
        "Add to Home Screen.";

      installButton.hidden = true;
      return;
    }

    if (!deferredInstallPrompt) {
      hideInstallCard();
      return;
    }

    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;

    await promptEvent.prompt();
    await promptEvent.userChoice;

    hideInstallCard();
  }

  window.addEventListener(
    "beforeinstallprompt",
    (event) => {
      event.preventDefault();

      deferredInstallPrompt = event;

      window.setTimeout(() => {
        showInstallCard("native");
      }, 1200);
    }
  );

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    hideInstallCard();
  });

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      documentReady = true;

      const {
        installButton,
        closeButton
      } = getElements();

      installButton?.addEventListener(
        "click",
        handleInstallClick
      );

      closeButton?.addEventListener(
        "click",
        () => {
          rememberDismissal();
          hideInstallCard();
        }
      );

      /*
       * iOS does not provide beforeinstallprompt.
       * Show platform-specific instructions instead.
       */

      if (
        isIos() &&
        !isInstalled() &&
        !hasBeenDismissed()
      ) {
        window.setTimeout(() => {
          showInstallCard("ios");
        }, 5000);
      }
    }
  );

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => {
          console.warn(
            "Service worker registration failed:",
            error
          );
        });
    });
  }
})();