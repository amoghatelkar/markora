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

The marketing and download page lives in [`website/`](website/). Deploy the repo on Vercel (root `vercel.json` builds the `website` folder). See [website/README.md](website/README.md).

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

## Desktop app (macOS)

Download the `.dmg` from [GitHub Releases](https://github.com/amoghatelkar/markora/releases/latest) or the [website](https://markora.opensourceapp.org/#download). Installers are built in CI and are **not** notarized with an Apple Developer ID yet.

If macOS blocks launch (“developer cannot be verified”, “damaged”, or “corrupted”):

1. Make sure the `.dmg` downloaded fully (roughly 100&nbsp;MB). A tiny file usually means a bad or 404 link — re-download from Releases.
2. Open Terminal and run: `xattr -cr /Applications/Markora.app`
3. Or right-click **Markora** in Applications → **Open** → **Open** once.

Build locally: `npm run build:desktop` (requires macOS for a `.dmg`).

## Tech Stack

- React 18 + TypeScript
- Vite
- TipTap (ProseMirror)
- Zustand
- Fuse.js (fuzzy search)
- Lucide React (icons)
- Electron (desktop shell)
