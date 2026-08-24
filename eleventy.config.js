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
   * Build a BibTeX entry for a publication from the fields the page
   * already carries. Only real data is emitted: there is no invented
   * volume, page range or DOI. An entry may override the guessed type
   * with bibtex_type, or supply a finished entry as bibtex.
   */
  eleventyConfig.addFilter("bibtex", (publication = {}) => {
    if (publication.bibtex) {
      return String(publication.bibtex).trim();
    }

    const tidy = (value) =>
      String(value ?? "").replace(/\s+/g, " ").trim();

    /*
     * Symbols marking equal contribution or a corresponding author are
     * display notation and do not belong in a citation. Some author
     * lists also use an Oxford comma, which leaves a stray "and" on the
     * final name once the list is split.
     */
    const authorList = tidy(publication.authors)
      .replace(/[*†‡§]/g, "")
      .split(/\s*,\s*/)
      .map((name) => name.replace(/^and\s+/i, "").trim())
      .filter(Boolean);

    const authors = authorList.join(" and ");
    const title = tidy(publication.title);
    const year = tidy(publication.year);
    const url = tidy(publication.primary_url);

    /*
     * Venues carry a trailing descriptor after a pipe on some entries,
     * which is useful on the page but noise in a citation.
     */
    const venue = tidy(publication.venue)
      .split("|")[0]
      .replace(/[,;]\s*$/, "")
      .trim();

    const surname = (authorList[0] || "anon")
      .split(/\s+/)
      .pop()
      .toLowerCase()
      .replace(/[^a-z]/g, "");

    const skip = new Set([
      "a", "an", "the", "on", "in", "of", "for",
      "with", "and", "to", "via", "by"
    ]);

    /*
     * A purely numeric leading token, as in "0-MMS", would produce a
     * key that runs into the year, so the first word-like token wins.
     */
    const word =
      title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .find(
          (candidate) =>
            candidate && !skip.has(candidate) && !/^\d+$/.test(candidate)
        ) || "untitled";

    const key = surname + year + word;

    const haystack = (
      venue + " " + tidy(publication.date)
    ).toLowerCase();

    let type = publication.bibtex_type;

    if (!type) {
      if (/thesis|dissertation/.test(haystack)) {
        type = "phdthesis";
      } else if (
        /conference|proceedings|symposium|workshop|icra|iros|cvpr|iccv|eccv|wacv|science and systems/.test(
          haystack
        )
      ) {
        type = "inproceedings";
      } else {
        type = "article";
      }
    }

    const container =
      type === "inproceedings"
        ? "booktitle"
        : type === "phdthesis"
          ? "school"
          : "journal";

    const fields = [
      ["author", authors],
      ["title", title],
      [container, venue],
      ["year", year],
      ["url", url]
    ];

    const body = fields
      .filter(([, value]) => value)
      .map(([name, value]) => "  " + name + " = {" + value + "}")
      .join(",\n");

    return "@" + type + "{" + key + ",\n" + body + "\n}";
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