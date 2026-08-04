export default function (eleventyConfig) {
  // Preserve the existing website assets unchanged.
  const assetDirectories = [
    "css",
    "extras",
    "fonts",
    "img",
    "js",
    "owl.carousel",
    "teaching"
  ];

  for (const directory of assetDirectories) {
    eleventyConfig.addPassthroughCopy(directory);
  }

  // Preserve the existing root HTML pages during incremental migration.
  const existingPages = [
    "index.html",
    "chahat.html",
    "news.html",
    "page-template.html",
    "teaching.html",
    "zoom.html",
    "CNAME"
  ];

  for (const page of existingPages) {
    eleventyConfig.addPassthroughCopy(page);
  }

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

