/*
 * Research project pages (src/research/).
 *
 * Nerfies-style paper pages written in Markdown. This plugin copies each
 * page's media, adds the shortcodes the pages use ({% figure %},
 * {% grid %}, {% carousel %}, ...), and protects $$...$$ equations from
 * the Markdown parser. How to write a page is documented in
 * src/research/README.md; the layout is layouts/research-project.njk.
 */

const MEDIA_GLOB =
  "src/research/**/*.{mp4,webm,mov,m4v,jpg,jpeg,png,gif,webp,avif,svg,pdf}";

const VIDEO_FILE = /\.(mp4|webm|mov|m4v)$/i;

const escapeAttr = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/*
 * Nunjucks passes keyword arguments ({% figure src="a.jpg" %}) as a
 * trailing object marked __keywords. Positional arguments are accepted
 * too, in the order given by `names`.
 */
function options(args, names = []) {
  const last = args[args.length - 1];
  const hasKeywords = last && typeof last === "object" && last.__keywords;
  const named = hasKeywords ? { ...last } : {};
  const positional = hasKeywords ? args.slice(0, -1) : args;

  names.forEach((name, index) => {
    if (named[name] === undefined && positional[index] !== undefined) {
      named[name] = positional[index];
    }
  });

  return named;
}

/* A front matter list, or a comma-separated string of paths. */
const pathList = (value) =>
  (Array.isArray(value) ? value : String(value ?? "").split(","))
    .map((item) => String(item).trim())
    .filter(Boolean);

/*
 * Relative media paths (static/videos/a.mp4) belong to the page's source
 * folder, not to its URL: src/research/fold-to-fit/index.md is published
 * as /research/fold-to-fit.html while its media is copied to
 * /research/fold-to-fit/static/. Return a function that turns such paths
 * into site-absolute ones; absolute paths and full URLs pass through.
 */
function resolverFor(page) {
  const stem = String(page?.filePathStem ?? "");
  const folder = stem.slice(0, stem.lastIndexOf("/") + 1);

  return (path) => {
    const value = String(path ?? "").trim();

    if (!value || !folder || /^([a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(value)) {
      return value;
    }

    return folder + value.replace(/^\.\//, "");
  };
}

/*
 * Guard $$...$$ math on research pages that set `math: true`.
 *
 * markdown-it would otherwise read `_` as emphasis and drop backslashes
 * before punctuation. Each equation becomes an element carrying the TeX
 * in an attribute, which Markdown leaves alone and KaTeX renders in the
 * browser. An equation on its own line is displayed; one inside a
 * sentence is inline. Code blocks and `code spans` are left untouched.
 */
function protectMath(content) {
  const pattern =
    /(^(```|~~~)[^\n]*\n[\s\S]*?^\2[^\n]*$)|((`+)[\s\S]*?\4)|\$\$([\s\S]+?)\$\$/gm;

  return content.replace(
    pattern,
    (match, fence, fenceMark, code, codeMark, tex, offset, whole) => {
      if (tex === undefined) {
        return match;
      }

      const before = whole.lastIndexOf("\n", offset - 1);
      const startsLine = whole.slice(before + 1, offset).trim() === "";
      const after = whole.indexOf("\n", offset + match.length);
      const endsLine =
        whole.slice(offset + match.length, after === -1 ? undefined : after)
          .trim() === "";

      const value = escapeAttr(tex.trim().replace(/\s*\n\s*/g, " "));

      return startsLine && endsLine
        ? `{% raw %}<div class="math-block" data-tex="${value}"></div>{% endraw %}`
        : `{% raw %}<span class="math-inline" data-tex="${value}"></span>{% endraw %}`;
    }
  );
}

/*
 * A <video> or <img>, chosen by file extension. Videos autoplay muted
 * and loop, as on the Nerfies page.
 */
function media({
  src,
  alt = "",
  poster,
  cls,
  controls = false,
  autoplay = true,
  lazy = true
}) {
  const path = String(src ?? "").trim();
  const classAttr = cls ? ` class="${escapeAttr(cls)}"` : "";

  if (VIDEO_FILE.test(path.split(/[?#]/)[0])) {
    const type = /\.webm$/i.test(path) ? "video/webm" : "video/mp4";
    const flags = [
      autoplay === false ? "" : "autoplay muted loop",
      controls === true ? "controls" : "",
      "playsinline"
    ]
      .filter(Boolean)
      .join(" ");
    const posterAttr = poster ? ` poster="${escapeAttr(poster)}"` : "";

    return (
      `<video ${flags} preload="metadata"${posterAttr}${classAttr}>` +
      `<source src="${escapeAttr(path)}" type="${type}"></video>`
    );
  }

  /* The teaser loads first; everything below it can wait. */
  const loading =
    lazy === false ? ' fetchpriority="high"' : ' loading="lazy"';

  return `<img src="${escapeAttr(path)}" alt="${escapeAttr(alt)}"${loading}${classAttr}>`;
}

export default function researchProjectPages(eleventyConfig) {
  eleventyConfig.addPassthroughCopy(MEDIA_GLOB);

  /* Guides that live next to the pages are for GitHub, not the site. */
  eleventyConfig.ignores.add("src/research/**/README.md");

  /*
   * A page is published at /research/<folder>.html, but people also type
   * /research/<folder>/, which holds only its media. Give each such folder
   * an index.html that forwards to the page.
   */
  eleventyConfig.addTemplate("research-folder-redirects.11ty.js", {
    data: {
      layout: false,
      eleventyExcludeFromCollections: true,
      pagination: {
        data: "collections.all",
        size: 1,
        alias: "target",
        before: (items) =>
          items.filter((item) => /^\/research\/[^/]+\.html$/.test(item.url))
      },
      permalink: (data) => data.target.url.replace(/\.html$/, "/index.html")
    },
    render(data) {
      const url = escapeAttr(data.target.url);

      return (
        "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">" +
        `<title>Redirecting…</title><meta name="robots" content="noindex">` +
        `<link rel="canonical" href="https://www.praisecu.com${url}">` +
        `<meta http-equiv="refresh" content="0; url=${url}">` +
        `<script>location.replace(${JSON.stringify(data.target.url)} + location.hash);</script>` +
        `</head><body><p><a href="${url}">Continue to the page</a></p></body></html>\n`
      );
    }
  });

  let markdown;

  eleventyConfig.amendLibrary("md", (library) => {
    markdown = library;
  });

  /* Markdown for captions and notes: **bold**, links, `code`. */
  const inline = (text) =>
    text ? markdown.renderInline(String(text)).trim() : "";

  const caption = (text) =>
    text ? `<figcaption>${inline(text)}</figcaption>` : "";

  eleventyConfig.addFilter("researchInline", inline);

  /* {{ image | researchUrl }}: a page-relative path made site-absolute. */
  eleventyConfig.addFilter("researchUrl", function (path) {
    return resolverFor(this.page)(path);
  });

  eleventyConfig.addPreprocessor(
    "researchMath",
    "md",
    (data, content) => {
      const inputPath = String(data.page?.inputPath ?? "").replace(/\\/g, "/");

      if (!data.math || !inputPath.includes("/research/")) {
        return;
      }

      return protectMath(content);
    }
  );

  /* Used by the layout for the teaser. */
  eleventyConfig.addShortcode("researchMedia", function (...args) {
    const url = resolverFor(this.page);
    const o = options(args, ["src"]);

    return media({ ...o, src: url(o.src), poster: o.poster && url(o.poster) });
  });

  /* {% figure src="static/images/pipeline.png", caption="Overview.", width="80%" %} */
  eleventyConfig.addShortcode("figure", function (...args) {
    const url = resolverFor(this.page);
    const o = options(args, ["src", "caption"]);
    const style = o.width ? ` style="max-width: ${escapeAttr(o.width)}"` : "";

    return (
      `<figure class="media-figure"${style}>` +
      media({
        src: url(o.src),
        alt: o.alt,
        poster: o.poster && url(o.poster),
        controls: o.controls,
        autoplay: o.autoplay
      }) +
      caption(o.caption) +
      "</figure>"
    );
  });

  /* {% grid items="a.mp4, b.mp4", captions="Ours | Baseline", columns=2 %} */
  eleventyConfig.addShortcode("grid", function (...args) {
    const url = resolverFor(this.page);
    const o = options(args, ["items"]);
    const captions = String(o.captions ?? "").split("|").map((c) => c.trim());
    const columns = [2, 3, 4, 6].includes(Number(o.columns))
      ? Number(o.columns)
      : 3;

    const cells = pathList(o.items)
      .map(
        (item, index) =>
          `<div class="column is-${12 / columns}-tablet">` +
          `<figure class="media-figure">` +
          media({ src: url(item), controls: o.controls }) +
          caption(captions[index]) +
          "</figure></div>"
      )
      .join("");

    return `<div class="columns is-multiline is-centered media-grid">${cells}</div>`;
  });

  /*
   * {% carousel items="a.mp4, b.jpg", slides=3, ratio="4 / 3" %}
   * Every slot has the same shape (16:9 by default); media is cropped
   * to fill it.
   */
  eleventyConfig.addShortcode("carousel", function (...args) {
    const url = resolverFor(this.page);
    const o = options(args, ["items"]);
    const items = pathList(o.items ?? o.videos);
    const slides = Number(o.slides) || 3;
    const style = o.ratio
      ? ` style="--pp-carousel-ratio: ${escapeAttr(o.ratio)}"`
      : "";

    const slots = items
      .map(
        (item) =>
          `<div class="item">${media({ src: url(item), controls: true })}</div>`
      )
      .join("");

    return `<div class="carousel results-carousel" data-slides="${slides}"${style}>${slots}</div>`;
  });

  /* {% youtube id="MrKrnHhk8IA" %}, the part after v= in the URL */
  eleventyConfig.addShortcode("youtube", (...args) => {
    const o = options(args, ["id"]);
    const title = escapeAttr(o.title || "Video");

    return (
      '<div class="publication-video">' +
      `<iframe src="https://www.youtube.com/embed/${escapeAttr(o.id)}?rel=0" title="${title}" ` +
      'frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" ' +
      'allowfullscreen loading="lazy"></iframe></div>'
    );
  });

  /* {% compare before="in.jpg", after="ours.jpg", before_label="Input", after_label="Ours" %} */
  eleventyConfig.addShortcode("compare", function (...args) {
    const url = resolverFor(this.page);
    const o = options(args, ["before", "after"]);
    const beforeLabel = o.before_label || "Before";
    const afterLabel = o.after_label || "After";
    const style = o.width ? ` style="max-width: ${escapeAttr(o.width)}"` : "";

    return (
      `<figure class="media-figure compare-figure"${style}><div class="compare">` +
      `<img class="compare-after" src="${escapeAttr(url(o.after))}" alt="${escapeAttr(afterLabel)}" loading="lazy">` +
      `<img class="compare-before" src="${escapeAttr(url(o.before))}" alt="${escapeAttr(beforeLabel)}" loading="lazy">` +
      '<div class="compare-handle" aria-hidden="true"></div>' +
      `<span class="compare-label compare-label-before">${escapeAttr(beforeLabel)}</span>` +
      `<span class="compare-label compare-label-after">${escapeAttr(afterLabel)}</span>` +
      '<input class="compare-range" type="range" min="0" max="100" value="50" aria-label="Comparison slider">' +
      `</div>${caption(o.caption)}</figure>`
    );
  });

  /*
   * Nerfies' interpolation slider over numbered frames (000000.jpg, ...).
   * {% frameslider dir="static/frames", frames=24, start="a.jpg", end="b.jpg" %}
   */
  eleventyConfig.addShortcode("frameslider", function (...args) {
    const url = resolverFor(this.page);
    const o = options(args, ["dir", "frames"]);
    const frames = Number(o.frames) || 1;
    const side = (src, label) =>
      src
        ? '<div class="column is-3 has-text-centered">' +
          `<img src="${escapeAttr(url(src))}" class="interpolation-image" alt="${escapeAttr(label)}">` +
          `<p>${escapeAttr(label)}</p></div>`
        : "";

    return (
      '<div class="frame-slider columns is-vcentered interpolation-panel" ' +
      `data-dir="${escapeAttr(url(o.dir))}" data-frames="${frames}" ` +
      `data-ext="${escapeAttr(o.ext || "jpg")}" data-pad="${Number(o.pad) || 6}" ` +
      `data-start="${Number(o.first) || 0}">` +
      side(o.start, o.start_label || "Start Frame") +
      '<div class="column interpolation-video-column">' +
      '<div class="interpolation-image-wrapper"><span class="frame-slider-loading">Loading…</span></div>' +
      `<input class="slider is-fullwidth is-large frame-slider-range" step="1" min="0" max="${frames - 1}" value="0" type="range" aria-label="Frame">` +
      "</div>" +
      side(o.end, o.end_label || "End Frame") +
      "</div>"
    );
  });

  /*
   * Side-by-side columns. The blank lines let Markdown inside each
   * column be parsed.
   *
   * {% columns %}
   * {% column %}Text{% endcolumn %}
   * {% column %}{% figure src="a.mp4" %}{% endcolumn %}
   * {% endcolumns %}
   */
  eleventyConfig.addPairedShortcode(
    "columns",
    (content) => `<div class="columns is-vcentered">\n\n${content.trim()}\n\n</div>`
  );

  eleventyConfig.addPairedShortcode(
    "column",
    (content) => `<div class="column">\n\n${content.trim()}\n\n</div>`
  );
}
