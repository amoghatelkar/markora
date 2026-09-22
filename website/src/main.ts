import './style.css'
import { initTheme } from './theme'
import { APP_VERSION, RELEASES_PAGE, detectOS, type DownloadOption } from './config'
import { resolveDownloads } from './releases'

function iconFor(id: DownloadOption['id']): string {
  switch (id) {
    case 'mac':
      return '⌘'
    case 'windows':
      return '⊞'
    case 'linux':
      return '◆'
    default:
      return '↓'
  }
}

function renderDownloadCard(option: DownloadOption, recommended: boolean, unavailable = false) {
  const card = document.createElement('article')
  card.className = `download-card${recommended ? ' download-card--recommended' : ''}`

  const href = unavailable ? RELEASES_PAGE : option.url
  const btnClass = unavailable ? 'btn btn-download btn-download--muted' : 'btn btn-download'
  const btnText = unavailable ? 'View releases on GitHub' : `Download for ${option.label}`
  const ariaLabel = unavailable ? undefined : `Download ${option.fileName}`

  const linkAttrs = unavailable
    ? 'target="_blank" rel="noopener noreferrer"'
    : 'target="_blank" rel="noopener noreferrer"'

  card.innerHTML = `
    <div class="download-card-top">
      <span class="download-os-icon" aria-hidden="true">${iconFor(option.id)}</span>
      <div>
        <h3>${option.label}${recommended ? ' <span class="pill">Recommended</span>' : ''}</h3>
        <p>${option.description}</p>
      </div>
    </div>
    <a class="${btnClass}" href="${href}" ${linkAttrs}${ariaLabel ? ` aria-label="${ariaLabel}"` : ''}>
      ${btnText}
    </a>
  `

  return card
}

function renderUnavailableBanner() {
  const banner = document.createElement('div')
  banner.className = 'download-banner'
  banner.innerHTML = `
    <p>
      <strong>Installers could not be loaded.</strong>
      Open
      <a href="${RELEASES_PAGE}" target="_blank" rel="noopener noreferrer">GitHub Releases</a>
      to download <code>Markora-${APP_VERSION}.dmg</code>, <code>Markora-Setup-${APP_VERSION}.exe</code>, or <code>Markora-${APP_VERSION}.AppImage</code>.
    </p>
  `
  return banner
}

function mountDownloads(downloads: DownloadOption[], unavailableFallback = false) {
  const os = detectOS()
  const primary = downloads.find((d) => d.id === os) ?? downloads[0]
  const grid = document.getElementById('download-grid')
  const section = document.getElementById('download')

  if (grid) {
    grid.innerHTML = ''
    const existingBanner = section?.querySelector('.download-banner')
    existingBanner?.remove()

    if (unavailableFallback && section) {
      section.insertBefore(renderUnavailableBanner(), grid)
    }
    for (const option of downloads) {
      grid.appendChild(renderDownloadCard(option, option.id === primary.id, unavailableFallback))
    }
  }

  const primaryBtn = document.getElementById('primary-download') as HTMLAnchorElement | null
  if (primaryBtn && primary) {
    primaryBtn.target = '_blank'
    primaryBtn.rel = 'noopener noreferrer'
    primaryBtn.removeAttribute('download')

    if (unavailableFallback) {
      primaryBtn.href = RELEASES_PAGE
      primaryBtn.textContent = 'View GitHub Releases'
    } else {
      primaryBtn.href = primary.url
      primaryBtn.textContent = `Download for ${primary.label}`
    }
  }
}

function setPrimaryFromGrid() {
  const os = detectOS()
  const primaryBtn = document.getElementById('primary-download') as HTMLAnchorElement | null
  const grid = document.getElementById('download-grid')
  if (!primaryBtn || !grid) return

  const links = Array.from(grid.querySelectorAll<HTMLAnchorElement>('.btn-download'))
  const labels = ['mac', 'windows', 'linux']
  const idx = labels.indexOf(os)
  const link = links[idx >= 0 ? idx : 0]
  if (link?.href) {
    primaryBtn.href = link.href
    primaryBtn.target = '_blank'
    primaryBtn.rel = 'noopener noreferrer'
    const label = os === 'mac' ? 'macOS' : os === 'windows' ? 'Windows' : os === 'linux' ? 'Linux' : 'your computer'
    primaryBtn.textContent = os === 'unknown' ? 'Download Markora' : `Download for ${label}`
  }
}

async function init() {
  initTheme()

  const releasesLink = document.getElementById('releases-link') as HTMLAnchorElement | null
  if (releasesLink) releasesLink.href = RELEASES_PAGE

  const yearEl = document.getElementById('year')
  if (yearEl) yearEl.textContent = String(new Date().getFullYear())

  setPrimaryFromGrid()

  const versionEl = document.getElementById('app-version')
  if (versionEl) versionEl.textContent = APP_VERSION

  const latest = await resolveDownloads()

  if (latest) {
    if (releasesLink) releasesLink.href = latest.releasesPage
    mountDownloads(latest.downloads, false)
    return
  }

}

init().catch((err) => {
  console.error('Markora download init failed:', err)
  setPrimaryFromGrid()
})
