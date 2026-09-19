import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = join(root, 'assets/markora-icon.svg')
const svg = readFileSync(svgPath)

const outputs = [
  join(root, 'public/markora-icon.png'),
  join(root, 'website/public/markora-icon.png'),
]

const png = await sharp(svg, { density: 384 }).resize(1024, 1024).png({ compressionLevel: 9 }).toBuffer()

for (const out of outputs) {
  writeFileSync(out, png)
  console.log('Wrote', out)
}
