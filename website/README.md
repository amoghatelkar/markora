# Markora Website

Marketing and download page for Markora, deployable on [Vercel](https://vercel.com).

## Local development

```bash
cd website
npm install
npm run dev
```

Open http://localhost:5173

## Deploy on Vercel

### Option A — Root directory (recommended)

1. Import the GitHub repo in Vercel.
2. Leave the **Root Directory** as the repository root (default).
3. Vercel uses the root `vercel.json`, which builds the `website/` folder.

### Option B — Website folder only

1. Set **Root Directory** to `website`.
2. Vercel uses `website/vercel.json`.

## Download links

Desktop installers are linked from GitHub Releases. Update `APP_VERSION` in `src/config.ts` when you publish a new release.

Build desktop apps from the repo root:

```bash
npm run build:desktop
```

Upload artifacts from `release/` to a GitHub release tagged `v0.1.0` (matching the version in config).

Expected file names:

- `Markora-0.1.0.dmg` (macOS)
- `Markora-Setup-0.1.0.exe` (Windows)
- `Markora-0.1.0.AppImage` (Linux)

If your electron-builder output names differ, adjust `getDownloadOptions()` in `src/config.ts`.
