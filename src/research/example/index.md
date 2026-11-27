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

title: "YourMethod: A Project Page in Markdown"
# Optional: the same title with markup for the heading only, here the method name in PRAISe gold.
title_html: '<span class="title-gold">YourMethod</span>: A Project Page in Markdown'
description: "One or two sentences about the paper. Used for search engines and for link previews on Twitter/X and Slack."
image: static/images/teaser.jpg          # link-preview image (JPG/PNG, 1200x630), see the README
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
# A single-lab paper can link its affiliation instead, with the PRAISe letters in bold gold:
# affiliations: [Perception, Robotics, AI and Sensing (PRAISe) Lab, University of Colorado Boulder]
# affiliations_html: '<a href="/"><b>P</b>erception, <b>R</b>obotics, <b>AI</b> and <b>S</b>ensing (<b>PRAISe</b>) Lab</a><br><a href="https://www.colorado.edu/" target="_blank" rel="noopener">University of Colorado Boulder</a>'

links:                                   # buttons under the authors; any Font Awesome / Academicons icon works
  - text: arXiv
    url: "#"                             # https://arxiv.org/abs/<id>
    icon: ai ai-arxiv
  - text: Results
    url: "#results"                      # jumps to <div id="results"></div> in the body
    icon: fas fa-chart-line
  - text: Code (Coming Soon)
    url: "#coming-soon"                  # shown dimmed and not clickable until released
    icon: fab fa-github
  - text: Video
    url: "#video"
    icon: fab fa-youtube
  - text: BibTeX
    url: "#BibTeX"                       # jumps to the BibTeX box at the bottom
    icon: fas fa-quote-right

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
  @inproceedings{author2026yourmethod,
    title     = {YourMethod: A Project Page in Markdown},
    author    = {Author, First and Author, Second and Author, Third and Author, Fourth},
    booktitle = {Conference Name},
    year      = {2026}
  }
---

<div class="stat-strip">
  <div class="stat-card"><span class="stat-value">1<small>st</small></span><span class="stat-label">on a public benchmark, with the date of the ranking</span></div>
  <div class="stat-card"><span class="stat-value">54%</span><span class="stat-label">fewer parameters than the strongest baseline</span></div>
  <div class="stat-card"><span class="stat-value">0.43<small>px</small></span><span class="stat-label">one headline number per card, with its unit</span></div>
  <div class="stat-card"><span class="stat-value">10×</span><span class="stat-label">a short label that says what the number means</span></div>
</div>

## Abstract

This page shows every building block of the lab's research page template, which keeps the look researchers know from the [Nerfies](https://nerfies.github.io) page. Everything above this paragraph, the title, authors, buttons, teaser and results strip, is generated from the header of `index.md`; everything below is ordinary Markdown with a few optional building blocks for videos, figures and comparisons.

The page uses the colors of the [PRAISe Lab](/) and has an optional dark mode behind the button at the top right. Replace this text with your abstract.

<div class="key-idea"><strong>Key insight.</strong> One or two sentences that a reader should remember from the paper.</div>

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

<div id="results"></div>

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

<div id="video"></div>

## Video

{% youtube id="MrKrnHhk8IA" %}

## Related Work

Point readers to concurrent and related projects here. [Nerfies](https://nerfies.github.io) is the origin of this layout, and the lab's [Research Areas](/research-areas.html) page lists its other projects. Ordinary Markdown links are fine.

## Acknowledgments

Thank your funding sources and colleagues. This section, like every other one on the page, is just a `##` heading followed by text.
