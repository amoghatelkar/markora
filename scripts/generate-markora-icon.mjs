import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = join(root, 'assets/markora-icon-source.png')

/** App / favicon icon: keep the designed dark squircle background opaque (no alpha). */
const png = await sharp(sourcePath)
  .ensureAlpha()
  .resize(1024, 1024, { fit: 'cover' })
  .flatten({ background: { r: 16, g: 16, b: 18 } })
  .png({ compressionLevel: 9, force: true })
  .toBuffer()

const outputs = [
  join(root, 'public/markora-icon.png'),
  join(root, 'website/public/markora-icon.png'),
  join(root, 'build/icon.png'),
]

for (const outPath of outputs) {
  writeFileSync(outPath, png)
  console.log('Wrote', outPath)
}
