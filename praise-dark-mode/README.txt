PRAISe Lab dark-mode package

WHAT IT ADDS
- Light mode remains the default.
- Desktop toggle appears immediately left of Research.
- Mobile toggle appears at the top-right of the header.
- The selected mode is saved in browser localStorage under:
    praise-theme
- The saved mode is restored before the page is painted to minimize flashing.
- Multiple open tabs stay synchronized.
- Existing page images are not filtered or recolored.

INSTALL
1. Extract this package anywhere.
2. Open PowerShell in the PRAISe repository:
     C:\praise-website-dev\praisecu.github.io
3. Run:
     powershell -ExecutionPolicy Bypass -File `
       .\praise-dark-mode\install-dark-mode.ps1
4. Build and test:
     npm run build
     npm run dev

TEST
- Desktop: toggle must appear immediately left of Research.
- Phone: toggle must appear at the top-right of the header.
- Select dark mode, reload, and confirm it remains dark.
- Switch back to light, reload, and confirm it remains light.
- Test Home, Teaching, Research Areas, Team, Media,
  Advanced CV, and AI for Engineering.

PUBLISH
  git status --short
  git add `
    css\dark-mode.css `
    js\theme-toggle.js `
    src\_includes\components\modern-header.njk `
    src\_includes\components\pwa-head.njk
  git commit -m "Add persistent light and dark modes"
  git push origin main

ROLLBACK
The installer creates a timestamped directory in the repository:
  .dark-mode-backup-YYYYMMDD-HHMMSS

Copy the backed-up Nunjucks files to:
  src\_includes\components\

Then remove:
  css\dark-mode.css
  js\theme-toggle.js

Do not commit the .dark-mode-backup-* directory.
