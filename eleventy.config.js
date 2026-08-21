import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

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
   * Append a content hash to local CSS and JS URLs.
   *
   * GitHub Pages serves assets with a ten minute cache
   * lifetime, so without this a visitor can load freshly
   * deployed HTML alongside a stylesheet still held in their
   * browser cache, which renders new markup unstyled. The hash
   * changes only when a file's contents change, so unmodified
   * assets stay cached across deploys.
   */
  const assetHashes = new Map();

  eleventyConfig.on("eleventy.before", () => {
    assetHashes.clear();
  });

  const assetHash = (urlPath) => {
    if (assetHashes.has(urlPath)) {
      return assetHashes.get(urlPath);
    }

    let hash = "";

    try {
      hash = createHash("sha1")
        .update(readFileSync("." + urlPath))
        .digest("hex")
        .slice(0, 8);
    } catch {
      /*
       * A missing file is left untouched so the URL keeps
       * whatever behaviour it had before.
       */
      hash = "";
    }

    assetHashes.set(urlPath, hash);

    return hash;
  };

  eleventyConfig.addTransform(
    "cacheBustLocalAssets",
    function (content) {
      const outputPath = this.page?.outputPath || "";

      if (!String(outputPath).endsWith(".html")) {
        return content;
      }

      return content.replace(
        /(href|src)="(\/(?:css|js)\/[^"?#]+\.(?:css|js))"/g,
        (match, attribute, urlPath) => {
          const hash = assetHash(urlPath);

          return hash
            ? attribute + '="' + urlPath + "?v=" + hash + '"'
            : match;
        }
      );
    }
  );

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

  /*
   * Generate the GitHub editing URL for an Eleventy
   * Markdown source file.
   */
  eleventyConfig.addFilter(
    "githubEditUrl",
    (inputPath = "", overridePath = "") => {
      const sourcePath = String(
        overridePath || inputPath
      )
        .replace(/\\/g, "/")
        .replace(/^\.\//, "")
        .replace(/^\/+/, "");

      /*
       * Show the control only for Markdown files under src.
       * Legacy HTML files therefore do not get an incorrect
       * edit link.
       */
      if (
        !sourcePath.startsWith("src/") ||
        !sourcePath.toLowerCase().endsWith(".md")
      ) {
        return "";
      }

      const encodedPath = sourcePath
        .split("/")
        .map(encodeURIComponent)
        .join("/");

      return (
        "https://github.com/" +
        "praisecu/praisecu.github.io/" +
        "edit/main/" +
        encodedPath
      );
    }
  );

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