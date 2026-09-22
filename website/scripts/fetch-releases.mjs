import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GITHUB_REPO = 'amoghatelkar/markora'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'src/release-data.json')
const indexPath = join(root, 'index.html')

const GH_HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'markora-website-build',
}

function readSiteVersion() {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  return pkg.version
}

function parseVersion(v) {
  return v.replace(/^v/, '').split('.').map((n) => Number(n) || 0)
}

function compareVersion(a, b) {
  const av = parseVersion(a)
  const bv = parseVersion(b)
  for (let i = 0; i < Math.max(av.length, bv.length); i++) {
    const diff = (av[i] ?? 0) - (bv[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: GH_HEADERS })
  if (!res.ok) return null
  return res.json()
}

function syntheticRelease(siteVersion) {
  const tag = `v${siteVersion}`
  const base = `https://github.com/${GITHUB_REPO}/releases/download/${tag}`
  return {
    tag_name: tag,
    html_url: `https://github.com/${GITHUB_REPO}/releases/tag/${tag}`,
    assets: [
      {
        name: `Markora-${siteVersion}.dmg`,
        browser_download_url: `${base}/Markora-${siteVersion}.dmg`,
      },
      {
        name: `Markora-Setup-${siteVersion}.exe`,
        browser_download_url: `${base}/Markora-Setup-${siteVersion}.exe`,
      },
      {
        name: `Markora-${siteVersion}.AppImage`,
        browser_download_url: `${base}/Markora-${siteVersion}.AppImage`,
      },
    ],
  }
}

async function resolveRelease(siteVersion) {
  const siteTag = `v${siteVersion}`

  const byTag = await fetchJson(
    `https://api.github.com/repos/${GITHUB_REPO}/releases/tags/${siteTag}`
  )
  if (byTag?.tag_name) return byTag

  const latest = await fetchJson(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
  const latestVer = latest?.tag_name?.replace(/^v/, '') ?? ''

  // Website package.json is the source of truth for the marketed version.
  if (compareVersion(siteVersion, latestVer) > 0) {
    return syntheticRelease(siteVersion)
  }

  if (latest?.tag_name) return latest

  return syntheticRelease(siteVersion)
}

function pickWindowsAsset(assets) {
  const setup = assets.find((a) => /setup/i.test(a.name) && /\.exe$/i.test(a.name))
  if (setup) return setup
  return assets.find(
    (a) =>
      /\.exe$/i.test(a.name) &&
      !/^elevate\.exe$/i.test(a.name) &&
      !/^markora\.exe$/i.test(a.name)
  )
}

function pickMacAsset(assets) {
  return assets.find((a) => /\.dmg$/i.test(a.name))
}

function pickLinuxAsset(assets) {
  return assets.find((a) => /\.appimage$/i.test(a.name))
}

function slim(asset) {
  return asset ? { name: asset.name, browser_download_url: asset.browser_download_url } : null
}

function card(icon, label, description, asset) {
  if (!asset) return ''
  return `
            <article class="download-card">
              <div class="download-card-top">
                <span class="download-os-icon" aria-hidden="true">${icon}</span>
                <div>
                  <h3>${label}</h3>
                  <p>${description}</p>
                </div>
              </div>
              <a
                class="btn btn-download"
                href="${asset.browser_download_url}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download ${asset.name}"
              >Download for ${label}</a>
            </article>`
}

function buildGridHtml(assets) {
  return [
    card('⌘', 'macOS', 'Apple Silicon &amp; Intel · .dmg', assets.mac),
    card('⊞', 'Windows', 'Windows 10+ · .exe installer', assets.windows),
    card('◆', 'Linux', 'AppImage · x64', assets.linux),
  ]
    .filter(Boolean)
    .join('\n')
}

function patchIndexHtml(release, assets, siteVersion) {
  let html = readFileSync(indexPath, 'utf8')
  const grid = buildGridHtml(assets)

  if (html.includes('<!-- RELEASE_DOWNLOADS -->')) {
    html = html.replace('<!-- RELEASE_DOWNLOADS -->', grid.trim())
  } else {
    const gridBlock =
      /<div id="download-grid" class="download-grid">[\s\S]*?<\/div>\s*(?=<p class="download-note")/
    if (!gridBlock.test(html)) {
      console.warn('Could not patch download grid — add <!-- RELEASE_DOWNLOADS --> to index.html')
      return
    }
    html = html.replace(
      gridBlock,
      `<div id="download-grid" class="download-grid">\n${grid}\n          </div>\n          `
    )
  }

  html = html.replace(
    /<span id="app-version">[^<]*<\/span>/,
    `<span id="app-version">${siteVersion}</span>`
  )
  html = html.replace(
    /id="releases-link" href="[^"]*"/,
    `id="releases-link" href="${release.html_url}"`
  )

  writeFileSync(indexPath, html)
}

async function main() {
  const siteVersion = readSiteVersion()
  const fallback = { generatedAt: new Date().toISOString(), release: null }

  try {
    const release = await resolveRelease(siteVersion)

    if (!release?.tag_name) {
      console.warn('No GitHub release found — writing empty release-data.json')
      writeFileSync(outPath, JSON.stringify(fallback, null, 2))
      return
    }

    const assets = release.assets ?? []

    const picked = {
      mac: slim(pickMacAsset(assets)),
      windows: slim(pickWindowsAsset(assets)),
      linux: slim(pickLinuxAsset(assets)),
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      release: {
        tag: release.tag_name,
        version: release.tag_name.replace(/^v/, ''),
        pageUrl: release.html_url,
        assets: picked,
      },
    }

    writeFileSync(outPath, JSON.stringify(payload, null, 2))
    patchIndexHtml(release, picked, siteVersion)
    console.log('Synced website downloads for', release.tag_name, `(site ${siteVersion})`)
  } catch (err) {
    console.warn('Failed to fetch releases:', err)
    writeFileSync(outPath, JSON.stringify(fallback, null, 2))
  }
}

main()
