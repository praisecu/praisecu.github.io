param(
  [string]$RepositoryRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = (Resolve-Path $RepositoryRoot).Path

$headerPath = Join-Path `
  $repoRoot `
  "src\_includes\components\modern-header.njk"

$pwaHeadPath = Join-Path `
  $repoRoot `
  "src\_includes\components\pwa-head.njk"

$cssDirectory = Join-Path $repoRoot "css"
$jsDirectory = Join-Path $repoRoot "js"

$requiredPaths = @(
  (Join-Path $repoRoot "eleventy.config.js"),
  $headerPath,
  $pwaHeadPath,
  $cssDirectory,
  $jsDirectory
)

foreach ($path in $requiredPaths) {
  if (!(Test-Path $path)) {
    throw "Required repository path not found: $path"
  }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDirectory = Join-Path `
  $repoRoot `
  ".dark-mode-backup-$timestamp"

New-Item `
  -ItemType Directory `
  -Path $backupDirectory `
  -Force |
Out-Null

Copy-Item `
  $headerPath `
  (Join-Path $backupDirectory "modern-header.njk")

Copy-Item `
  $pwaHeadPath `
  (Join-Path $backupDirectory "pwa-head.njk")

$existingDarkCss = Join-Path $cssDirectory "dark-mode.css"
$existingThemeJs = Join-Path $jsDirectory "theme-toggle.js"

if (Test-Path $existingDarkCss) {
  Copy-Item `
    $existingDarkCss `
    (Join-Path $backupDirectory "dark-mode.css")
}

if (Test-Path $existingThemeJs) {
  Copy-Item `
    $existingThemeJs `
    (Join-Path $backupDirectory "theme-toggle.js")
}

Copy-Item `
  (Join-Path $packageRoot "dark-mode.css") `
  $existingDarkCss `
  -Force

Copy-Item `
  (Join-Path $packageRoot "theme-toggle.js") `
  $existingThemeJs `
  -Force

$utf8 = [System.Text.Encoding]::UTF8
$utf8NoBom = New-Object `
  System.Text.UTF8Encoding($false)

function Read-Utf8File([string]$Path) {
  return [System.IO.File]::ReadAllText(
    $Path,
    $utf8
  )
}

function Write-Utf8File(
  [string]$Path,
  [string]$Content
) {
  [System.IO.File]::WriteAllText(
    $Path,
    $Content,
    $utf8NoBom
  )
}

# Patch the shared PWA/head component.

$pwaHead = Read-Utf8File $pwaHeadPath
$pwaHead = $pwaHead.Replace(
  "`r`n",
  "`n"
)

$pwaHead = $pwaHead.Replace(
  '<meta name="theme-color" content="#111207">',
  '<meta name="theme-color" content="#ffffff">'
)

if (!$pwaHead.Contains('/css/dark-mode.css')) {
  $pwaInstallScript =
    '<script src="/js/pwa-install.js" defer></script>'

  if (!$pwaHead.Contains($pwaInstallScript)) {
    throw "Could not locate the PWA install script in pwa-head.njk."
  }

  $themeHeadMarkup = @'
<script>
  (() => {
    let theme = "light";

    try {
      if (
        window.localStorage.getItem(
          "praise-theme"
        ) === "dark"
      ) {
        theme = "dark";
      }
    } catch {
      theme = "light";
    }

    document.documentElement.dataset.theme = theme;
  })();
</script>

<link rel="stylesheet" href="/css/dark-mode.css">
<script src="/js/theme-toggle.js" defer></script>

'@

  $pwaHead = $pwaHead.Replace(
    $pwaInstallScript,
    $themeHeadMarkup + $pwaInstallScript
  )
}

Write-Utf8File $pwaHeadPath $pwaHead

# Patch the shared header component.

$header = Read-Utf8File $headerPath
$header = $header.Replace(
  "`r`n",
  "`n"
)

if (!$header.Contains('theme-toggle--mobile')) {
  $mobileNeedle = @'
    </a>

    <button
      class="modern-header__menu-button"
'@

  if (!$header.Contains($mobileNeedle)) {
    throw "Could not find the mobile-button insertion point."
  }

  $mobileReplacement = @'
    </a>

    <button
      class="theme-toggle theme-toggle--mobile"
      type="button"
      data-theme-toggle
      aria-label="Switch to dark mode"
      aria-pressed="false"
      title="Switch to dark mode"
    >
      <i
        class="fa fa-moon-o theme-toggle__moon"
        aria-hidden="true"
      ></i>

      <i
        class="fa fa-sun-o theme-toggle__sun"
        aria-hidden="true"
      ></i>

      <span class="theme-toggle__label">
        Switch to dark mode
      </span>
    </button>

    <button
      class="modern-header__menu-button"
'@

  $header = $header.Replace(
    $mobileNeedle,
    $mobileReplacement
  )
}

if (!$header.Contains('theme-toggle--desktop')) {
  $desktopNeedle = @'
  aria-label="Primary navigation"
>
  <div class="modern-header__dropdown">
'@

  if (!$header.Contains($desktopNeedle)) {
    throw "Could not find the desktop-button insertion point."
  }

  $desktopReplacement = @'
  aria-label="Primary navigation"
>
  <button
    class="theme-toggle theme-toggle--desktop"
    type="button"
    data-theme-toggle
    aria-label="Switch to dark mode"
    aria-pressed="false"
    title="Switch to dark mode"
  >
    <i
      class="fa fa-moon-o theme-toggle__moon"
      aria-hidden="true"
    ></i>

    <i
      class="fa fa-sun-o theme-toggle__sun"
      aria-hidden="true"
    ></i>

    <span class="theme-toggle__label">
      Switch to dark mode
    </span>
  </button>

  <div class="modern-header__dropdown">
'@

  $header = $header.Replace(
    $desktopNeedle,
    $desktopReplacement
  )
}

Write-Utf8File $headerPath $header

Write-Host ""
Write-Host "Dark mode installed successfully." `
  -ForegroundColor Green

Write-Host "Backup: $backupDirectory"
Write-Host ""
Write-Host "Next commands:"
Write-Host "  npm run build"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "The saved preference uses localStorage key:"
Write-Host "  praise-theme"
