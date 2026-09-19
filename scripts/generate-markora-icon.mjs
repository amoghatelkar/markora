import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = join(root, 'assets/markora-icon.svg')

const svg = readFileSync(svgPath)

const png = await sharp(svg, { density: 384 })
  .resize(1024, 1024)
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toBuffer()

const outputs = [
  join(root, 'public/markora-icon.png'),
  join(root, 'website/public/markora-icon.png'),
  join(root, 'public/markora-icon.svg'),
  join(root, 'website/public/markora-icon.svg'),
]

writeFileSync(join(root, 'public/markora-icon.svg'), svg)
writeFileSync(join(root, 'website/public/markora-icon.svg'), svg)

for (const outPath of outputs.filter((p) => p.endsWith('.png'))) {
  writeFileSync(outPath, png)
  console.log('Wrote', outPath)
}

console.log('Wrote SVG copies to public/ and website/public/')
