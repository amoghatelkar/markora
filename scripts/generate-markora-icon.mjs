import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = join(root, 'assets/markora-icon-source.png')
const size = 1024
const radius = 118 / 512 // match original squircle proportion

function lerp(a, b, t) {
  return a + (b - a) * t
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** Integrated squircle field — not flat black. */
function backgroundRgb(x, y, w, h) {
  const nx = (x - w / 2) / (w / 2)
  const ny = (y - h / 2) / (h / 2)
  const r = Math.sqrt(nx * nx + ny * ny)
  const vignette = 1 - smoothstep(0.35, 1.05, r)

  const base = 10 + vignette * 14
  const lift = (1 - ny) * 0.12 + (1 - nx) * 0.04
  const rCh = base + lift * 8
  const gCh = base + lift * 6 + 2
  const bCh = base + lift * 10 + 16

  const rim = smoothstep(0.78, 0.98, r)
  return [
    rCh + rim * 18,
    gCh + rim * 20,
    bCh + rim * 32,
  ]
}

function metallicRgb(t) {
  const shadow = [58, 62, 78]
  const deep = [108, 114, 132]
  const mid = [178, 184, 200]
  const bright = [232, 236, 246]
  const spec = [255, 255, 255]

  if (t < 0.2) {
    const u = t / 0.2
    return [lerp(shadow[0], deep[0], u), lerp(shadow[1], deep[1], u), lerp(shadow[2], deep[2], u)]
  }
  if (t < 0.52) {
    const u = (t - 0.2) / 0.32
    return [lerp(deep[0], mid[0], u), lerp(deep[1], mid[1], u), lerp(deep[2], mid[2], u)]
  }
  if (t < 0.8) {
    const u = (t - 0.52) / 0.28
    return [lerp(mid[0], bright[0], u), lerp(mid[1], bright[1], u), lerp(mid[2], bright[2], u)]
  }
  const u = (t - 0.8) / 0.2
  return [lerp(bright[0], spec[0], u), lerp(bright[1], spec[1], u), lerp(bright[2], spec[2], u)]
}

function ribbonWeight(lum, r, g, b) {
  const chroma = Math.max(r, g, b) - Math.min(r, g, b)
  let w = smoothstep(34, 72, lum)
  w *= 1 - smoothstep(248, 255, lum) * 0.15
  if (chroma > 8 && lum > 50) {
    w = Math.min(1, w + chroma / 220)
  }
  return w
}

const { data, info } = await sharp(sourcePath)
  .resize(size, size, { fit: 'fill' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const { width, height, channels } = info
const out = Buffer.alloc(data.length)

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

    const bg = backgroundRgb(x, y, width, height)
    const mask = ribbonWeight(lum, r, g, b)

    let t = Math.min(1, (lum - 40) / 150)
    t = Math.pow(t, 0.65)
    const maxCh = Math.max(r, g, b)
    if (maxCh > 180) t = Math.min(1, t + (maxCh - 180) / 130)

    const metal = metallicRgb(t)

    const nx = (x - width / 2) / (width / 2)
    const ny = (y - height / 2) / (height / 2)
    const contact = mask * smoothstep(0.15, 0.55, Math.abs(ny) + Math.abs(nx) * 0.2) * 0.12
    metal[0] -= contact * 40
    metal[1] -= contact * 40
    metal[2] -= contact * 35

    const edgeSoften = smoothstep(0.02, 0.22, mask) * mask

    out[i] = Math.round(lerp(bg[0], metal[0], edgeSoften))
    out[i + 1] = Math.round(lerp(bg[1], metal[1], edgeSoften))
    out[i + 2] = Math.round(lerp(bg[2], metal[2], edgeSoften))

    const corner = Math.max(Math.abs(nx), Math.abs(ny))
    const cornerDark = smoothstep(0.88, 1.02, corner) * 6
    out[i] = Math.max(0, out[i] - cornerDark)
    out[i + 1] = Math.max(0, out[i + 1] - cornerDark)
    out[i + 2] = Math.max(0, out[i + 2] - cornerDark + cornerDark * 0.4)

    out[i + 3] = 255
  }
}

let pipeline = sharp(out, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .sharpen({ sigma: 0.45, m1: 0.4, m2: 0.2 })

const png = await pipeline.toBuffer()

const outputs = [
  join(root, 'public/markora-icon.png'),
  join(root, 'website/public/markora-icon.png'),
]

for (const outPath of outputs) {
  writeFileSync(outPath, png)
  console.log('Wrote', outPath)
}
