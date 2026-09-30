---
# ============================================================================
# Example research page. Copy this whole folder to src/research/<your-project>/
# and edit. Everything between the --- lines is the page header;
# src/research/README.md documents every field.
# ============================================================================

# These two lines keep this example out of search engines and the sitemap.
# Delete them in your copy.
noindex: true
eleventyExcludeFromCollections: true

title: "Your Paper Title: A Project Page in Markdown"
description: "One or two sentences about the paper. Used for search engines and for link previews on Twitter/X and Slack."
image: static/images/teaser.jpg          # link-preview image (JPG/PNG, ~1200x630)
keywords: [robotics, perception, template]

venue: "Conference Name 2026"            # optional
# award: "Best Paper Award"              # optional

authors:
  - name: First Author
    url: https://example.com             # optional personal page
    affiliations: [1]
    note: "*"                            # optional marker, explained in author_notes
  - name: Second Author
    url: https://example.com
    affiliations: [1]
    note: "*"
  - name: Third Author
    url: https://example.com
    affiliations: [2]
  - name: Fourth Author
    url: https://example.com
    affiliations: [1]
affiliations:
  - First Institution
  - Second Institution
author_notes: "*Equal contribution"

links:                                   # buttons under the authors; any Font Awesome / Academicons icon works
  - text: Paper
    url: "#"
    icon: fas fa-file-pdf
  - text: arXiv
    url: "#"
    icon: ai ai-arxiv
  - text: Video
    url: "#"
    icon: fab fa-youtube
  - text: Code
    url: https://github.com/praisecu
    icon: fab fa-github
  - text: Data
    url: "#"
    icon: fas fa-database

teaser:
  video: static/videos/teaser.mp4        # or `image: static/images/teaser.jpg`
  poster: static/images/teaser.jpg       # first frame shown while the video loads (videos only)
  caption: "**Our method** turns a one-line caption under the teaser into a chance to say what the paper does."

carousel:                                # optional strip of videos and/or photos; delete to remove
  - static/videos/result1.mp4
  - static/videos/result2.mp4
  - static/videos/result3.mp4
  - static/videos/result4.mp4
  - static/videos/result5.mp4

math: true                               # set when the page has equations

bibtex: |
  @inproceedings{author2026paper,
    title     = {Your Paper Title: A Project Page in Markdown},
    author    = {Author, First and Author, Second and Author, Third and Author, Fourth},
    booktitle = {Conference Name},
    year      = {2026}
  }
---

## Abstract

This page shows every building block of the lab's research page template, which keeps the look researchers know from the [Nerfies](https://nerfies.github.io) page. Everything above this paragraph, the title, authors, buttons, teaser and results strip, is generated from the header of `index.md`; everything below is ordinary Markdown with a few optional building blocks for videos, figures and comparisons.

The page uses the colors of the [PRAISe Lab](/) and has an optional dark mode behind the button at the top right. Replace this text with your abstract.

## Video

{% youtube id="MrKrnHhk8IA" %}

## Method

{% figure src="static/images/pipeline.png", caption="**Figure 1.** A figure with a caption. Markdown works inside captions." %}

Write your method as normal Markdown: paragraphs, **bold**, *italics*, `code` and lists. Equations go between double dollar signs. Inline math like $$\mathbf{x}_t = f_\theta(\mathbf{x}_{t-1}, \mathbf{u}_t)$$ sits in the sentence, and a display equation goes on its own lines:

$$
\mathcal{L}(\theta) = \mathbb{E}_{(\mathbf{x}, \mathbf{y}) \sim \mathcal{D}} \left[ \left\lVert f_\theta(\mathbf{x}) - \mathbf{y} \right\rVert_2^2 \right] + \lambda \, \mathcal{R}(\theta)
$$

### Subsections

Use `###` for subsections. Two columns side by side, text next to a video the way the Nerfies page pairs its *Visual Effects* text with a clip:

{% columns %}
{% column %}
**Left column.** Any Markdown works here: paragraphs, lists, links, figures.
{% endcolumn %}
{% column %}
{% figure src="static/videos/result1.mp4" %}
{% endcolumn %}
{% endcolumns %}

## Results

{% grid items="static/videos/result2.mp4, static/videos/result3.mp4, static/videos/result4.mp4", captions="Ours | Baseline A | Baseline B", columns=3 %}

Videos autoplay muted and loop, like on Nerfies. Add `controls=true` to any figure or grid to show a play bar. Tables are plain Markdown:

| Method       | PSNR ↑ | LPIPS ↓ | Runtime |
|--------------|:------:|:-------:|:-------:|
| Baseline A   | 28.1   | 0.142   | 3.2 s   |
| Baseline B   | 29.4   | 0.118   | 1.9 s   |
| **Ours**     | **31.7** | **0.087** | **0.4 s** |

## Comparisons

{% compare before="static/images/compare_before.jpg", after="static/images/compare_after.jpg", before_label="Input", after_label="Ours", caption="Drag the handle to compare two images with the same aspect ratio." %}

The Nerfies interpolation slider scrubs through a folder of numbered frames, which you can produce from any video with one `ffmpeg` command (see the README):

{% frameslider dir="static/frames", frames=24, start="static/images/frame_start.jpg", end="static/images/frame_end.jpg" %}

## Related Work

Point readers to concurrent and related projects here. [Nerfies](https://nerfies.github.io) is the origin of this layout, and the lab's [Research Areas](/research-areas.html) page lists its other projects. Ordinary Markdown links are fine.

## Acknowledgements

Thank your funding sources and colleagues. This section, like every other one on the page, is just a `##` heading followed by text.
