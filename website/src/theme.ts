export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'markora-website-theme'

function systemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  return pref === 'system' ? systemTheme() : pref
}

function themeColor(theme: 'light' | 'dark') {
  return theme === 'dark' ? '#08080c' : '#f6f5f2'
}

function updateToggle(pref: ThemePreference, resolved: 'light' | 'dark') {
  const btn = document.getElementById('theme-toggle')
  if (!btn) return
  const next =
    pref === 'system' ? 'System' : pref === 'dark' ? 'Dark' : 'Light'
  btn.setAttribute('aria-label', `Theme: ${next}. Click to change.`)
  btn.setAttribute('title', `Theme: ${next}`)
  btn.dataset.theme = resolved
}

export function applyThemePreference(pref: ThemePreference) {
  const resolved = resolveTheme(pref)
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.setAttribute('data-theme-pref', pref)
  localStorage.setItem(STORAGE_KEY, pref)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor(resolved))
  updateToggle(pref, resolved)
}

function cyclePreference(current: ThemePreference): ThemePreference {
  if (current === 'system') return 'light'
  if (current === 'light') return 'dark'
  return 'system'
}

export function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null
  const pref = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  applyThemePreference(pref)

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const active = localStorage.getItem(STORAGE_KEY) as ThemePreference | null
    if (active === 'system' || !active) applyThemePreference('system')
  })

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = (localStorage.getItem(STORAGE_KEY) as ThemePreference) || 'system'
    applyThemePreference(cyclePreference(current))
  })
}
