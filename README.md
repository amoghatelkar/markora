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

## Tech Stack

- React 18 + TypeScript
- Vite
- TipTap (ProseMirror)
- Zustand
- Fuse.js (fuzzy search)
- Lucide React (icons)
- Electron (desktop shell)
