import { chmod, rename, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * AppImage runs the app binary directly (not the .desktop Exec line).
 * Chromium's setuid sandbox must be disabled via argv before Electron starts.
 */
export default async function afterPack(context) {
  if (context.electronPlatformName !== 'linux') return

  const exe = context.packager.executableName
  const appOutDir = context.appOutDir
  const launcher = join(appOutDir, exe)
  const binary = join(appOutDir, `${exe}-bin`)

  try {
    await stat(launcher)
  } catch {
    return
  }

  await rename(launcher, binary)

  const script = `#!/bin/sh
DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$DIR/${exe}-bin" --no-sandbox --disable-setuid-sandbox "$@"
`

  await writeFile(launcher, script, { mode: 0o755 })
  await chmod(launcher, 0o755)
}
