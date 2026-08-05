(() => {
  "use strict";

  const content = document.querySelector(
    ".course-content__body"
  );

  if (
    !content ||
    content.classList.contains(
      "course-content__body--sectioned"
    )
  ) {
    return;
  }

  const children = Array.from(content.children);

  let currentSection = null;
  let preamble = null;
  let sectionNumber = 0;

  children.forEach((element) => {
    if (element.matches("h2")) {
      sectionNumber += 1;

      if (!element.id) {
        element.id = `course-section-${sectionNumber}`;
      }

      currentSection =
        document.createElement("section");

      currentSection.className =
        "course-content-section";

      currentSection.setAttribute(
        "aria-labelledby",
        element.id
      );

      element.before(currentSection);
      currentSection.appendChild(element);

      return;
    }

    if (currentSection) {
      currentSection.appendChild(element);
      return;
    }

    /*
     * Preserve any content that appears before the first
     * section heading, such as a notice or introductory link.
     */

    if (!preamble) {
      preamble = document.createElement("div");
      preamble.className =
        "course-content-preamble";

      element.before(preamble);
    }

    preamble.appendChild(element);
  });

  content.classList.add(
    "course-content__body--sectioned"
  );
})();