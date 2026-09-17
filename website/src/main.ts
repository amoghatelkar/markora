import './style.css'
import {
  APP_VERSION,
  GITHUB_REPO,
  RELEASES_PAGE,
  detectOS,
  getDownloadOptions,
  type DownloadOption,
} from './config'
import { fetchLatestDownloads } from './releases'

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
  const btnText = unavailable
    ? 'Not published yet — see GitHub'
    : `Download ${option.fileName}`

  card.innerHTML = `
    <div class="download-card-top">
      <span class="download-os-icon" aria-hidden="true">${iconFor(option.id)}</span>
      <div>
        <h3>${option.label}${recommended ? ' <span class="pill">Recommended</span>' : ''}</h3>
        <p>${option.description}</p>
      </div>
    </div>
    <a class="${btnClass}" href="${href}" ${unavailable ? 'target="_blank" rel="noopener noreferrer"' : 'download'}>
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
      <strong>Desktop builds are not on GitHub yet.</strong>
      Create a release (tag <code>v${APP_VERSION}</code>) with your installer files, or run the
      <a href="https://github.com/${GITHUB_REPO}/actions" target="_blank" rel="noopener noreferrer">Release workflow</a>
      after merging the latest changes.
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
    if (unavailableFallback && section) {
      section.insertBefore(renderUnavailableBanner(), grid)
    }
    for (const option of downloads) {
      grid.appendChild(renderDownloadCard(option, option.id === primary.id, unavailableFallback))
    }
  }

  const primaryBtn = document.getElementById('primary-download') as HTMLAnchorElement | null
  if (primaryBtn && primary) {
    if (unavailableFallback) {
      primaryBtn.href = RELEASES_PAGE
      primaryBtn.removeAttribute('download')
      primaryBtn.target = '_blank'
      primaryBtn.rel = 'noopener noreferrer'
      primaryBtn.textContent = 'View GitHub Releases'
    } else {
      primaryBtn.href = primary.url
      primaryBtn.setAttribute('download', '')
      primaryBtn.textContent = `Download for ${primary.label}`
    }
  }
}

async function init() {
  const releasesLink = document.getElementById('releases-link') as HTMLAnchorElement | null
  if (releasesLink) releasesLink.href = RELEASES_PAGE

  const yearEl = document.getElementById('year')
  if (yearEl) yearEl.textContent = String(new Date().getFullYear())

  const versionEl = document.getElementById('app-version')
  const latest = await fetchLatestDownloads()

  if (latest) {
    if (versionEl) versionEl.textContent = latest.version
    if (releasesLink) releasesLink.href = latest.releasesPage
    mountDownloads(latest.downloads, false)
    return
  }

  if (versionEl) versionEl.textContent = APP_VERSION
  mountDownloads(getDownloadOptions(APP_VERSION), true)
}

init()
