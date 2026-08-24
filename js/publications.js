/*
 * Publications page: filter by year and copy a BibTeX entry.
 *
 * Both controls are progressive enhancements. The filter bar ships
 * hidden and is revealed here, so a visitor without JavaScript sees the
 * full, unfiltered list rather than a set of buttons that do nothing.
 */
(function () {
  "use strict";

  var list = document.querySelector(".publications-list");

  if (!list) {
    return;
  }

  var items = Array.prototype.slice.call(
    list.querySelectorAll(".publication-item")
  );

  /* ---------------------------------------------------------------
     Year filter
     --------------------------------------------------------------- */

  var filter = document.querySelector(".publication-filter");
  var status = document.querySelector(".publication-filter__status");

  if (filter && items.length) {
    filter.hidden = false;

    var chips = Array.prototype.slice.call(
      filter.querySelectorAll(".publication-filter__chip")
    );

    var apply = function (year) {
      var shown = 0;

      items.forEach(function (item) {
        var match = year === "all" || item.dataset.year === year;

        item.hidden = !match;

        if (match) {
          shown += 1;
        }
      });

      chips.forEach(function (chip) {
        var active = chip.dataset.year === year;

        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", active ? "true" : "false");
      });

      if (status) {
        status.textContent =
          year === "all"
            ? ""
            : "Showing " +
              shown +
              (shown === 1 ? " publication" : " publications") +
              " from " +
              year +
              ".";
      }
    };

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        apply(chip.dataset.year);
      });
    });
  }

  /* ---------------------------------------------------------------
     Copy BibTeX
     --------------------------------------------------------------- */

  var copyText = function (text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    /*
     * Fallback for browsers without the async clipboard API. The
     * textarea has to be in the document and focusable for execCommand
     * to see a selection.
     */
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
