# Research project pages

Each folder here is one paper's project page, written in **Markdown**. The pages use the [Nerfies](https://nerfies.github.io) layout (title, authors and link buttons, a teaser video, a results carousel, sections, and BibTeX) in the lab's colors, with an optional dark mode.

A folder `src/research/<name>/` is published at **`https://www.praisecu.com/research/<name>.html`**.

The [example page](example/index.md) uses every building block. Copy it to start your own.

---

## Add a page for your paper

1. **Pick a short folder name.** Use lowercase words with hyphens, e.g. `minimal-perception`. It becomes the URL.
2. **Create `src/research/<name>/index.md`.** Copy in the contents of [`example/index.md`](example/index.md), then edit it:
   - Delete the `noindex` and `eleventyExcludeFromCollections` lines. They keep the example out of search engines; your page should be found.
   - Fill in the header between the two `---` lines. The reference below covers every field.
   - Replace the example sections with your own Markdown.
3. **Add your media** under `src/research/<name>/static/`, e.g. `static/videos/teaser.mp4` and `static/images/teaser.jpg`. Paths in `index.md` are relative to your folder.
4. **Open a pull request.** The site's GitHub Action builds every pull request, so a green check means the page built. Once the pull request is merged, the page goes live within a couple of minutes.

**Without installing anything:** press `.` on the repository's GitHub page to open it in a web-based VS Code editor. Create your folder, paste in the example, drag your media into `static/`, and commit to a new branch to start the pull request.

**With a local preview:** install Node.js 22 or newer, then in the repository run the two commands below. Open `http://localhost:8080/research/<name>.html`. The page rebuilds whenever you save.

```bash
npm ci
```

```bash
npm run dev
```

---

## The page header (front matter)

Everything between the `---` lines at the top of `index.md` is YAML. Only `title` is required; leave out anything you don't need and that part of the page disappears.

| Field | What it does |
|---|---|
| `title` | Paper title. **Wrap it in quotes if it contains a colon.** |
| `subtitle` | Optional line under the title. |
| `description` | One or two sentences, used by search engines and link previews. |
| `image` | Preview image for link previews on Slack, X, etc. (JPG/PNG, about 1200×630). |
| `venue` / `award` | Shown as chips under the title, e.g. `"CVPR 2026"`, `"Best Paper Award"`. |
| `authors` | List of `name`, optional `url`, `affiliations: [1, 2]`, and `note: "*"`. |
| `affiliations` | List of institutions. Superscript numbers appear automatically when there is more than one. |
| `author_notes` | Line under the affiliations, e.g. `"*Equal contribution"`. |
| `links` | Buttons: `text`, `url`, `icon`. The same icons appear in the footer. |
| `teaser` | A video or photo path (`static/videos/teaser.mp4`, `static/images/teaser.jpg`), or `video:` / `image:` / `youtube:` with optional `poster:` (videos only), `alt:` and `caption:`. |
| `carousel` | List of videos and/or photos for the results strip. Every slot is 16:9 and media is cropped to fill it; `carousel_ratio: "4 / 3"` (or `"1 / 1"`, `"3 / 4"`) changes the shape. `carousel_slides: 2` shows two at a time (default 3). |
| `math: true` | Needed for `$$...$$` equations to render. |
| `bibtex` | Your BibTeX entry, after `bibtex: \|` and indented. A Copy button is added. |
| `dark_mode: false` | Always light for this page, with no toggle. |

**Icons.** Some common choices:
- `fas fa-file-pdf` (paper)
- `ai ai-arxiv` (arXiv)
- `fab fa-youtube` (video)
- `fab fa-github` (code)
- `fas fa-database` (data)
- `fas fa-images` (gallery)
- `fas fa-chalkboard` (slides)
- `fas fa-scroll` (poster)
- `fas fa-cube` (demo)
- `ai ai-google-scholar` (Google Scholar)

Any [Font Awesome 6 Free](https://fontawesome.com/search?o=r&m=free) or [Academicons](https://jpswalsh.github.io/academicons/) class works.

---

## Writing the body

The body is ordinary Markdown:

- `## Heading` starts a section and is centered with a gold underline, like Nerfies.
- `### Heading` starts a subsection.
- Paragraphs, **bold**, *italics*, links, lists, tables, `code` and fenced code blocks all work as usual.
- Equations go between `$$ ... $$`, either inside a sentence (inline) or on their own lines (displayed). They need `math: true` in the header.

For media, use these building blocks. Put each on its own line with a blank line before and after, and **separate the settings with commas**.

```text
{% figure src="static/images/pipeline.png", caption="**Figure 1.** Overview.", width="80%" %}
{% figure src="static/videos/demo.mp4", controls=true %}

{% grid items="static/videos/ours.mp4, static/videos/baseline.mp4", captions="Ours | Baseline", columns=2 %}

{% youtube id="MrKrnHhk8IA" %}

{% carousel items="static/videos/a.mp4, static/images/b.jpg, static/videos/c.mp4" %}

{% compare before="static/images/input.jpg", after="static/images/ours.jpg", before_label="Input", after_label="Ours" %}

{% frameslider dir="static/frames", frames=24, start="static/images/start.jpg", end="static/images/end.jpg" %}
```

What each one does:

- `figure`: one image or video with an optional caption (Markdown allowed).
- `grid`: several side by side (`columns` = 2, 3, 4 or 6), with captions separated by `|`.
- `youtube`: the `id` is the part after `v=` in the video's URL.
- `carousel`: an extra results strip inside the body.
- `compare`: a before/after slider; both images must be the same size.
- `frameslider`: the Nerfies scrubbing slider over numbered frames.

**Two columns** (text next to a video):

```text
{% columns %}
{% column %}
Some **Markdown** text on the left.
{% endcolumn %}
{% column %}
{% figure src="static/videos/effect.mp4" %}
{% endcolumn %}
{% endcolumns %}
```

---

## Photos and videos

Anywhere a video goes, a photo works too: the teaser, the carousel, `figure` and `grid` all check the file extension and show `.jpg`, `.png`, `.webp` or `.gif` files as images. For example, a photo teaser:

```yaml
teaser:
  image: static/images/teaser.jpg
  alt: Our robot flying through a forest
  caption: "**Our method** in one sentence."
```

**Keep files small.** Photos should be about 1600–2000 px wide and under 500 KB. Videos should be a few MB each, and must be under GitHub's 100 MB limit.

Videos autoplay muted and loop, as on Nerfies. These [ffmpeg](https://ffmpeg.org/download.html) commands produce files that play everywhere, including iPhones.

Re-encode to H.264, 1280 px wide, no audio, web-optimized:

```bash
ffmpeg -i input.mov -vf "scale=1280:-2" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an static/videos/teaser.mp4
```

Save the first frame as a poster image:

```bash
ffmpeg -i static/videos/teaser.mp4 -frames:v 1 -q:v 3 static/images/teaser.jpg
```

Export numbered frames for `frameslider` (10 per second, 720 px wide):

```bash
ffmpeg -i interpolation.mp4 -vf "fps=10,scale=720:-2" -start_number 0 -q:v 4 static/frames/%06d.jpg
```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| The pull request's build fails | Open the failed check's log. It is usually YAML: a title or caption with a `:` or `#` that isn't in quotes, or uneven indentation under `authors:` or `links:`. A missing comma between settings in `{% figure ... %}` also fails the build. |
| An image or video doesn't show | Check the path and capitalization: `static/videos/Teaser.MP4` and `static/videos/teaser.mp4` are different files on the live site. |
| An equation shows as nothing or as raw text | Add `math: true` to the header, and make sure the equation is between `$$` pairs. |
| A video doesn't play on iPhone | Re-encode it with the ffmpeg command above; it must be H.264 MP4. |
| `{{`, `{%` or `{#` in your text breaks the page | These start template tags. Wrap that text in `{% raw %}` ... `{% endraw %}`. Equations are already protected. |

---

## How it works (for maintainers)

- **Layout:** `src/_includes/layouts/research-project.njk`. It is applied to everything in this folder by `research.11tydata.json`, and reuses the site's `seo.njk` and `analytics.njk`.
- **Shortcodes, media copying and equation handling:** `eleventy.research.js`, registered in `eleventy.config.js`.
- **Styles and scripts:** `css/research-project/` and `js/research-project/`, used only by these pages.
  - Colors and corner radii are variables at the top of `project.css`.
  - The light/dark choice is stored under the same `praise-theme` key as the rest of the site. Pages are light until a visitor picks dark, like the rest of the site.

The design is adapted from the [Nerfies](https://github.com/nerfies/nerfies.github.io) project page and, like it, released under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Each page's footer keeps the link back. Bundled libraries: [Bulma](https://bulma.io), [bulma-carousel](https://github.com/Wikiki/bulma-carousel) and [bulma-slider](https://github.com/Wikiki/bulma-slider) (all MIT). Font Awesome, Academicons and KaTeX load from CDNs.
