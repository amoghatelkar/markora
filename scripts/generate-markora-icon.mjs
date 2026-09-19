import { readFileSync, writeFileSync } from 'node:fs'
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
  const r = data[o]
  const g = data[o + 1]
  const b = data[o + 2]
  const a = data[o + 3]
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

  if (lum < 32) {
    continue
  }

  const t = Math.min(1, (lum - 32) / 140)
  const shade = Math.round(220 + t * 35)
  out[o] = shade
  out[o + 1] = shade
  out[o + 2] = shade
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
