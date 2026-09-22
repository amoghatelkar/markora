/** Injected at build time from package.json (see vite.config.ts). */
declare const __MARKORA_VERSION__: string

export const APP_VERSION =
  typeof __MARKORA_VERSION__ !== 'undefined' ? __MARKORA_VERSION__ : 'dev'
