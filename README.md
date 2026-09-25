# Markora

A modern document editor built for Markdown.

## Design System

Markora features a premium design system built on centralized design tokens, sophisticated dark/light themes, and carefully tuned typography. The interface is minimal, precise, and professional — designed to feel like a polished commercial productivity application.

### Key Features

- **Design tokens** — Centralized CSS variables for colors, spacing, typography, borders, shadows, and animation
- **Dark & light themes** — Purpose-built palettes (not simple inversion)
- **Command palette** — Fuzzy search with keyboard navigation (`⌘K` / `Ctrl+K`)
- **Focus & Zen modes** — Distraction-free writing experiences
- **Premium editor** — TipTap-powered with configurable document widths
- **Resizable sidebar** — Document outline with collapsible panel
- **Context menus** — Polished custom menus with platform shortcuts

## Website (Vercel)

The marketing and download page lives in [`website/`](website/). The **online editor** is served at `/app/` on the same Vercel deploy (`npm run build:web` + root `vercel.json`). See [website/README.md](website/README.md).

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
npm run typecheck
npm run build
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Command palette | `⌘K` / `Ctrl+K` |
| New document | `⌘N` / `Ctrl+N` |
| Open document | `⌘O` / `Ctrl+O` |
| Toggle sidebar | `⌘\` / `Ctrl+\` |
| Focus mode | `⌘⇧F` / `Ctrl+Shift+F` |
| Zen mode | `⌘⇧Z` / `Ctrl+Shift+Z` |
| Toggle Markdown source | `⌘⇧M` / `Ctrl+Shift+M` |

## Desktop app

Download installers from [GitHub Releases](https://github.com/opensourceapp-org/markora/releases/latest) or the [website](https://markora.opensourceapp.org/#download).

**macOS without Terminal:** open the `.dmg`, copy Markora to Applications, then **right-click → Open → Open** the first time only. Step-by-step for all platforms: [docs/DESKTOP_INSTALL.md](docs/DESKTOP_INSTALL.md).

Build locally: `npm run build:desktop` (macOS required for a `.dmg`). Maintainers: [docs/CODE_SIGNING.md](docs/CODE_SIGNING.md) for notarized builds that open with a normal double-click.

## Tech Stack

- React 18 + TypeScript
- Vite
- TipTap (ProseMirror)
- Zustand
- Fuse.js (fuzzy search)
- Lucide React (icons)
- Electron (desktop shell)
