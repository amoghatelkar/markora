/** Resolve public asset paths for web deploy (e.g. /app/) and Electron. */
export function assetUrl(file: string): string {
  const base = import.meta.env.BASE_URL
  const path = file.startsWith('/') ? file.slice(1) : file
  return `${base}${path}`
}
