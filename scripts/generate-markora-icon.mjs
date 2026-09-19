import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = join(root, 'assets/markora-icon-source.png')

const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
const out = Buffer.from(data)

for (let i = 0; i < width * height; i++) {
  const o = i * channels
  let r = data[o]
  let g = data[o + 1]
  let b = data[o + 2]
  const a = data[o + 3]

  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

  if (lum < 28) {
    out[o] = r
    out[o + 1] = g
    out[o + 2] = b
    out[o + 3] = a
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
