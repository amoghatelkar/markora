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
3. Vercel uses the root `vercel.json`, which builds the marketing site and bundles the **online editor** at `/app/`.

### Option B — Website folder only

1. Set **Root Directory** to `website`.
2. Vercel uses `website/vercel.json`.

## Download links

The site loads **real download URLs** from the GitHub API:

`GET /repos/opensourceapp-org/markora/releases/latest`

If no release exists yet, buttons show a notice instead of linking to a 404.

### Publish installers (recommended)

After merging the Release workflow (`.github/workflows/release.yml`):

**Important:** Bump `version` in the root `package.json` to match the tag before releasing (e.g. `0.1.2` → tag `v0.1.2`). Otherwise installer filenames may not match the tag.

```bash
git tag v0.1.2
git push origin v0.1.2
```

GitHub Actions builds macOS, Windows, and Linux installers and attaches them to the release. Redeploy Vercel if needed; the site picks up assets automatically.

### Manual upload

```bash
npm run build:desktop
```

Create a GitHub release tagged `v0.1.2` and upload files from `release/`:

- `Markora-0.1.2.dmg`
- `Markora-Setup-0.1.2.exe`
- `Markora-0.1.2.AppImage`

Update `APP_VERSION` in `src/config.ts` when the version changes (fallback copy only).
