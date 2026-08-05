# PRAISe Lab Website

Official website for the Perception, Robotics, AI and Sensing (PRAISe) Lab at the University of Colorado Boulder.

- Website: https://praisecu.com
- GitHub Pages mirror: https://praisecu.github.io

The site is built with [Eleventy](https://www.11ty.dev/) from Markdown and Nunjucks templates.

## Local development

Requirements:

- Node.js 22 or newer
- npm
- Git

Install dependencies:

```powershell
npm ci
```

Start the local development server:

```powershell
npm run dev
```

Eleventy prints the local URL, normally:

```text
http://localhost:8080
```

Create a production build:

```powershell
npm run build
```

The generated website is written to `_site/`.

Do not edit files inside `_site/`. Eleventy recreates that directory on every build.

## Where to edit content

### Main pages

Edit the Markdown files in `src/`:

```text
src/index.md
src/news.md
src/research-areas.md
src/publications.md
src/team.md
src/media.md
src/teaching.md
src/openings.md
```

### News

The homepage and the News page use the same shared news data.

Edit:

```text
src/_data/news.json
```

Add new entries with a machine-readable date and place the newest entry at any position; Eleventy sorts news by date and displays the latest eight items on the homepage.

### Teaching pages

Edit course pages in:

```text
src/teaching/
```

Current migrated pages include:

```text
src/teaching/advancedcv-fall2024.md
src/teaching/advancedcv-fall2025.md
src/teaching/advancedcv-fall2026.md
src/teaching/ai4engg-spring2026.md
src/teaching/haq-spring2025.md
src/teaching/medtronicnav-spring2025.md
```

Legacy teaching pages that have not been migrated remain under `teaching/` and are copied by Eleventy.

### Shared layout and navigation

```text
src/_includes/components/modern-header.njk
src/_includes/components/modern-footer.njk
src/_includes/layouts/
```

Changes to these files affect multiple pages.

### Styling

Global and page-specific styles are stored in:

```text
css/
```

Important files include:

```text
css/modern-header.css
css/modern-footer.css
css/home-page.css
css/teaching-course.css
css/markdown-pages.css
```

### JavaScript

Client-side scripts are stored in:

```text
js/
```

### Images and media

General website media:

```text
img/
```

Legacy teaching assets:

```text
teaching/img/
```

Do not rename existing assets unless every reference to the asset is updated.

## URLs and permalinks

The Markdown pages define explicit `permalink` values to preserve the existing public URLs.

Do not change a permalink unless the public URL is intentionally being changed.

## Deployment

GitHub Pages deployment is handled by:

```text
.github/workflows/deploy-pages.yml
```

The workflow:

1. installs dependencies with `npm ci`;
2. runs `npm run build`;
3. uploads `_site/`;
4. deploys the generated site to GitHub Pages.

The GitHub repository's Pages source must be set to **GitHub Actions**.

## Before committing

Run:

```powershell
Remove-Item .\_site -Recurse -Force -ErrorAction SilentlyContinue
npm ci
npm run build
git diff --check
git status
```

Verify that the expected pages were generated:

```powershell
$pages = @(
  "_site\index.html",
  "_site\news.html",
  "_site\research-areas.html",
  "_site\publications.html",
  "_site\team.html",
  "_site\media.html",
  "_site\teaching.html",
  "_site\openings.html",
  "_site\teaching\advancedcv-fall2024.html",
  "_site\teaching\advancedcv-fall2025.html",
  "_site\teaching\advancedcv-fall2026.html",
  "_site\teaching\ai4engg-spring2026.html",
  "_site\teaching\haq-spring2025.html",
  "_site\teaching\medtronicnav-spring2025.html"
)

$pages | ForEach-Object {
  [PSCustomObject]@{
    Page = $_
    Exists = Test-Path $_
  }
}
```

All entries should report `True`.

## Files that are generated or local-only

These paths should not be committed:

```text
node_modules/
_site/
```

They are excluded through `.gitignore`.

## Custom domain

Keep the root `CNAME` file. Eleventy copies it into the deployed `_site/` directory so `praisecu.com` remains connected to GitHub Pages.
