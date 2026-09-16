import './style.css'
import {
  APP_VERSION,
  RELEASES_PAGE,
  detectOS,
  getDownloadOptions,
  type DownloadOption,
} from './config'

const downloads = getDownloadOptions(APP_VERSION)
const os = detectOS()
const primary = downloads.find((d) => d.id === os) ?? downloads[0]

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

function renderDownloadCard(option: DownloadOption, recommended: boolean) {
  const card = document.createElement('article')
  card.className = `download-card${recommended ? ' download-card--recommended' : ''}`

  card.innerHTML = `
    <div class="download-card-top">
      <span class="download-os-icon" aria-hidden="true">${iconFor(option.id)}</span>
      <div>
        <h3>${option.label}${recommended ? ' <span class="pill">Recommended</span>' : ''}</h3>
        <p>${option.description}</p>
      </div>
    </div>
    <a class="btn btn-download" href="${option.url}" download>
      Download ${option.fileName}
    </a>
  `

  return card
}

const grid = document.getElementById('download-grid')
if (grid) {
  for (const option of downloads) {
    grid.appendChild(renderDownloadCard(option, option.id === primary.id))
  }
}

const primaryBtn = document.getElementById('primary-download') as HTMLAnchorElement | null
if (primaryBtn && primary) {
  primaryBtn.href = primary.url
  primaryBtn.setAttribute('download', '')
  primaryBtn.textContent = `Download for ${primary.label}`
}

const versionEl = document.getElementById('app-version')
if (versionEl) versionEl.textContent = APP_VERSION

const releasesLink = document.getElementById('releases-link') as HTMLAnchorElement | null
if (releasesLink) releasesLink.href = RELEASES_PAGE

const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = String(new Date().getFullYear())
