import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = join(root, 'assets/markora-icon-source.png')

function lerp(a, b, t) {
  return a + (b - a) * t
}

/** Cool platinum / silver ramp from shadow through specular highlights. */
function metallicRgb(t) {
  const shadow = [72, 76, 92]
  const deep = [118, 124, 142]
  const mid = [175, 182, 198]
  const bright = [228, 232, 242]
  const spec = [255, 255, 255]

  if (t < 0.22) {
    const u = t / 0.22
    return [lerp(shadow[0], deep[0], u), lerp(shadow[1], deep[1], u), lerp(shadow[2], deep[2], u)]
  }
  if (t < 0.55) {
    const u = (t - 0.22) / 0.33
    return [lerp(deep[0], mid[0], u), lerp(deep[1], mid[1], u), lerp(deep[2], mid[2], u)]
  }
  if (t < 0.82) {
    const u = (t - 0.55) / 0.27
    return [lerp(mid[0], bright[0], u), lerp(mid[1], bright[1], u), lerp(mid[2], bright[2], u)]
  }
  const u = (t - 0.82) / 0.18
  return [lerp(bright[0], spec[0], u), lerp(bright[1], spec[1], u), lerp(bright[2], spec[2], u)]
}

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

  if (lum < 30) {
    continue
  }

  let t = Math.min(1, (lum - 30) / 165)
  t = Math.pow(t, 0.78)

  const maxCh = Math.max(r, g, b)
  if (maxCh > 200) {
    t = Math.min(1, t + (maxCh - 200) / 220)
  }

  const [nr, ng, nb] = metallicRgb(t)
  out[o] = Math.round(nr)
  out[o + 1] = Math.round(ng)
  out[o + 2] = Math.round(nb)
  out[o + 3] = a
}

let pipeline = sharp(out, { raw: { width, height, channels } })

pipeline = pipeline
  .modulate({ brightness: 1.04, saturation: 0.92 })
  .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.25 })

const png = await pipeline.png({ compressionLevel: 9 }).toBuffer()

const outputs = [
  join(root, 'public/markora-icon.png'),
  join(root, 'website/public/markora-icon.png'),
]

for (const outPath of outputs) {
  writeFileSync(outPath, png)
  console.log('Wrote', outPath)
}
