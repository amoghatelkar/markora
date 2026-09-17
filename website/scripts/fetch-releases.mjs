import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GITHUB_REPO = 'amoghatelkar/markora'
const outPath = join(dirname(fileURLToPath(import.meta.url)), '../src/release-data.json')

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

    const slim = (asset) =>
      asset
        ? { name: asset.name, browser_download_url: asset.browser_download_url }
        : null

    const payload = {
      generatedAt: new Date().toISOString(),
      release: {
        tag: release.tag_name,
        version: release.tag_name.replace(/^v/, ''),
        pageUrl: release.html_url,
        assets: {
          mac: slim(pickMacAsset(assets)),
          windows: slim(pickWindowsAsset(assets)),
          linux: slim(pickLinuxAsset(assets)),
        },
      },
    }

    writeFileSync(outPath, JSON.stringify(payload, null, 2))
    console.log('Wrote release-data.json for', release.tag_name)
  } catch (err) {
    console.warn('Failed to fetch releases:', err)
    writeFileSync(outPath, JSON.stringify(fallback, null, 2))
  }
}

main()
