/*
 * Publications page: copy a BibTeX entry to the clipboard.
 *
 * A progressive enhancement. Without JavaScript the Cite button simply
 * does nothing, and the publication list itself is unaffected.
 */
(function () {
  "use strict";

  /*
   * Older path, and the safety net when the Clipboard API refuses. The
   * textarea has to be in the document and selected for execCommand to
   * see anything to copy.
   */
  var copyBySelection = function (text) {
    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");

      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";

      document.body.appendChild(field);
      field.select();

      try {
        document.execCommand("copy") ? resolve() : reject();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(field);
      }
    });
  };

  /*
   * The Clipboard API can reject even where it exists, for instance when
   * the document has lost focus, so a rejection falls through to the
   * selection method rather than being reported as a failure outright.
   */
  var copyText = function (text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        return copyBySelection(text);
      });
    }

    return copyBySelection(text);
  };

  Array.prototype.forEach.call(
    document.querySelectorAll(".publication-item__cite"),
    function (button) {
      var label = button.querySelector(".publication-item__cite-label");
      var original = label ? label.textContent.trim() : "";
      var reset;

      button.addEventListener("click", function () {
        var entry = button.dataset.bibtex || "";

        if (!entry) {
          return;
        }

        copyText(entry).then(
          function () {
            if (!label) {
              return;
            }

            button.classList.add("is-copied");
            label.textContent = "Copied";

            window.clearTimeout(reset);

            reset = window.setTimeout(function () {
              button.classList.remove("is-copied");
              label.textContent = original;
            }, 2000);
          },
          function () {
            if (label) {
              label.textContent = "Press Ctrl+C";
            }
          }
        );
      });
    }
  );
})();
