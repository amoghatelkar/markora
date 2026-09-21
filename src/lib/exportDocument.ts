import { markdownToHtml } from '@/lib/markdown'

export type ExportFormat = 'markdown' | 'html' | 'text' | 'pdf'

const EXPORT_STYLES = `
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 11pt;
    line-height: 1.65;
    color: #1a1a1a;
    max-width: 42rem;
    margin: 2rem auto;
    padding: 0 1.25rem;
  }
  h1 { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.75rem; }
  h2 { font-size: 1.35rem; font-weight: 600; margin: 1.5rem 0 0.5rem; }
  h3 { font-size: 1.15rem; font-weight: 600; margin: 1.25rem 0 0.4rem; }
  p { margin: 0.75em 0; color: #333; }
  a { color: #1a1a1a; text-decoration: underline; }
  code, pre { font-family: ui-monospace, monospace; font-size: 0.9em; }
  pre {
    background: #f5f5f5;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    padding: 1rem;
    overflow-x: auto;
  }
  code { background: #f0f0f0; padding: 0.1em 0.35em; border-radius: 4px; }
  pre code { background: none; padding: 0; }
  blockquote {
    margin: 1em 0;
    padding-left: 1em;
    border-left: 3px solid #ccc;
    color: #555;
  }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: #f7f7f7; font-weight: 600; }
  img { max-width: 100%; height: auto; }
  hr { border: none; border-top: 1px solid #ddd; margin: 2rem 0; }
  @media print {
    body { margin: 0; padding: 0; max-width: none; }
  }
`

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function baseFileName(title: string): string {
  const trimmed = title.trim() || 'Untitled'
  return trimmed.replace(/\.(md|markdown|txt|html)$/i, '')
}

function downloadBlob(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

function buildStandaloneHtml(title: string, markdown: string): string {
  const body = markdownToHtml(markdown)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${EXPORT_STYLES}</style>
</head>
<body>
  <article>${body}</article>
</body>
</html>`
}

function markdownToPlainText(markdown: string): string {
  const html = markdownToHtml(markdown)
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim()
}

export function exportDocument(
  title: string,
  content: string,
  format: ExportFormat
): { ok: true } | { ok: false; reason: string } {
  const base = baseFileName(title)

  switch (format) {
    case 'markdown': {
      downloadBlob(
        `${base}.md`,
        new Blob([content], { type: 'text/markdown;charset=utf-8' })
      )
      return { ok: true }
    }
    case 'html': {
      const html = buildStandaloneHtml(title, content)
      downloadBlob(`${base}.html`, new Blob([html], { type: 'text/html;charset=utf-8' }))
      return { ok: true }
    }
    case 'text': {
      const plain = markdownToPlainText(content)
      downloadBlob(`${base}.txt`, new Blob([plain], { type: 'text/plain;charset=utf-8' }))
      return { ok: true }
    }
    case 'pdf': {
      const html = buildStandaloneHtml(title, content)
      const win = window.open('', '_blank', 'noopener,noreferrer')
      if (!win) {
        return { ok: false, reason: 'Allow pop-ups to export PDF, or use Print from the HTML export.' }
      }
      win.document.open()
      win.document.write(html)
      win.document.close()
      const printWhenReady = () => {
        win.focus()
        win.print()
      }
      if (win.document.readyState === 'complete') {
        requestAnimationFrame(printWhenReady)
      } else {
        win.addEventListener('load', printWhenReady, { once: true })
      }
      return { ok: true }
    }
    default:
      return { ok: false, reason: 'Unknown format' }
  }
}
