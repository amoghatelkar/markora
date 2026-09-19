import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const appDist = join(root, 'dist')
const siteDist = join(root, 'website/dist')
const appOut = join(siteDist, 'app')

if (!existsSync(appDist)) {
  console.error('Missing dist/ — run npm run build:web first')
  process.exit(1)
}

if (!existsSync(siteDist)) {
  console.error('Missing website/dist — run website build first')
  process.exit(1)
}

rmSync(appOut, { recursive: true, force: true })
mkdirSync(appOut, { recursive: true })
cpSync(appDist, appOut, { recursive: true })

console.log('Copied editor build to website/dist/app')
