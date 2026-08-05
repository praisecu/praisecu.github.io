export default function (eleventyConfig) {
  // Preserve the existing website assets unchanged.
  const assetDirectories = [
    "css",
    "extras",
    "fonts",
    "img",
    "js",
    "owl.carousel",
    "teaching/css",
    "teaching/img",
    "teaching/js"
  ];

  for (const directory of assetDirectories) {
    eleventyConfig.addPassthroughCopy(directory);
  }

  /*
   * Preserve root-level pages that have not yet been
   * migrated to Eleventy.
   */
  const existingPages = [
    "chahat.html",
    "page-template.html",
    "zoom.html",
    "CNAME"
  ];

  for (const page of existingPages) {
    eleventyConfig.addPassthroughCopy(page);
  }

  /*
   * Preserve teaching pages that have not yet been migrated.
   *
   * advancedcv-fall2026.html is intentionally excluded because
   * src/teaching/advancedcv-fall2026.md generates that URL.
   */
  const legacyTeachingPages = [
    "teaching/mcen5228.html",
    "teaching/sfm.html"
  ];

  for (const page of legacyTeachingPages) {
    eleventyConfig.addPassthroughCopy(page);
  }

  /*
   * Sort news entries newest first using date_iso.
   */
  eleventyConfig.addFilter("sortNewsNewest", (items = []) => {
    return [...items].sort((first, second) => {
      const firstDate =
        Date.parse(first?.date_iso ?? "") || 0;

      const secondDate =
        Date.parse(second?.date_iso ?? "") || 0;

      return secondDate - firstDate;
    });
  });

  /*
   * Return only the requested number of items.
   */
  eleventyConfig.addFilter("take", (items = [], count = 8) => {
    return Array.isArray(items)
      ? items.slice(0, count)
      : [];
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}