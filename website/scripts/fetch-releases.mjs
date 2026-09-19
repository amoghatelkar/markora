import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GITHUB_REPO = 'amoghatelkar/markora'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outPath = join(root, 'src/release-data.json')
const indexPath = join(root, 'index.html')

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
              >Download ${asset.name}</a>
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

function patchIndexHtml(release, assets) {
  let html = readFileSync(indexPath, 'utf8')
  const grid = buildGridHtml(assets)

  if (html.includes('<!-- RELEASE_DOWNLOADS -->')) {
    html = html.replace('<!-- RELEASE_DOWNLOADS -->', grid.trim())
  } else {
    // Match through the grid's closing tag (not the first nested </div>).
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

  const version = release.tag_name.replace(/^v/, '')
  html = html.replace(
    /<span id="app-version">[^<]*<\/span>/,
    `<span id="app-version">${version}</span>`
  )
  html = html.replace(
    /id="releases-link" href="[^"]*"/,
    `id="releases-link" href="${release.html_url}"`
  )

  writeFileSync(indexPath, html)
}

async function main() {
  const fallback = { generatedAt: new Date().toISOString(), release: null }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'markora-website-build',
        },
      }
    )

    if (!res.ok) {
      console.warn(`GitHub API ${res.status} — writing empty release-data.json`)
      writeFileSync(outPath, JSON.stringify(fallback, null, 2))
      return
    }

    const release = await res.json()
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
    patchIndexHtml(release, picked)
    console.log('Synced website downloads for', release.tag_name)
  } catch (err) {
    console.warn('Failed to fetch releases:', err)
    writeFileSync(outPath, JSON.stringify(fallback, null, 2))
  }
}

main()
