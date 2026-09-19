import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = join(root, 'assets/markora-icon-source.png')

const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
const out = Buffer.from(data)
const pixelCount = width * height
const background = new Uint8Array(pixelCount)

function lumAt(o) {
  return 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]
}

function isBackgroundPixel(o) {
  const lum = lumAt(o)
  if (lum < 115) return true
  const r = data[o]
  const g = data[o + 1]
  const b = data[o + 2]
  const chroma = Math.max(r, g, b) - Math.min(r, g, b)
  return lum < 150 && chroma < 28
}

const queue = []
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (x !== 0 && x !== width - 1 && y !== 0 && y !== height - 1) continue
    const i = y * width + x
    const o = i * channels
    if (!isBackgroundPixel(o)) continue
    background[i] = 1
    queue.push(i)
  }
}

while (queue.length > 0) {
  const i = queue.pop()
  const x = i % width
  const y = (i / width) | 0
  const neighbors = [
    x > 0 ? i - 1 : -1,
    x < width - 1 ? i + 1 : -1,
    y > 0 ? i - width : -1,
    y < height - 1 ? i + width : -1,
  ]
  for (const ni of neighbors) {
    if (ni < 0 || background[ni]) continue
    const o = ni * channels
    if (!isBackgroundPixel(o)) continue
    background[ni] = 1
    queue.push(ni)
  }
}

for (let i = 0; i < pixelCount; i++) {
  const o = i * channels
  if (background[i]) {
    out[o] = 0
    out[o + 1] = 0
    out[o + 2] = 0
    out[o + 3] = 0
    continue
  }

  let r = data[o]
  let g = data[o + 1]
  let b = data[o + 2]
  const a = data[o + 3]
  const lum = lumAt(o)

  if (lum < 48) {
    out[o] = 0
    out[o + 1] = 0
    out[o + 2] = 0
    out[o + 3] = 0
    continue
  }

  const blueLean = b - Math.max(r, g)
  const isBlueTinted = blueLean > 6 && lum > 40

  if (isBlueTinted || lum > 45) {
    const t = Math.min(1, lum / 255)
    const highlight = Math.pow(t, 0.82)
    const base = 90 + highlight * 165
    const cool = 4 + (1 - t) * 8
    r = Math.min(255, base + cool * 0.3)
    g = Math.min(255, base + cool * 0.15)
    b = Math.min(255, base + cool * 0.5)
  } else {
    r = data[o]
    g = data[o + 1]
    b = data[o + 2]
  }

  out[o] = Math.round(r)
  out[o + 1] = Math.round(g)
  out[o + 2] = Math.round(b)
  out[o + 3] = a
}

const png = await sharp(out, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toBuffer()

const outputs = [
  join(root, 'public/markora-icon.png'),
  join(root, 'website/public/markora-icon.png'),
]

for (const outPath of outputs) {
  writeFileSync(outPath, png)
  console.log('Wrote', outPath)
}
