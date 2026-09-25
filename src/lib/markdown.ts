import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { parseMarkdownWithHeadingIds } from '@/lib/markedHeadingIds'

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

turndown.use(gfm)

turndown.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => `~~${content}~~`,
})

/** Normalize TipTap table HTML before Turndown (GFM tables need simple table markup). */
export function prepareHtmlForMarkdown(html: string): string {
  if (typeof DOMParser === 'undefined') return html

  const doc = new DOMParser().parseFromString(html, 'text/html')

  for (const colgroup of doc.querySelectorAll('colgroup')) {
    colgroup.remove()
  }

  for (const table of doc.querySelectorAll('table')) {
    table.removeAttribute('style')
    for (const el of table.querySelectorAll('[style]')) {
      el.removeAttribute('style')
    }
  }

  for (const cell of doc.querySelectorAll('th, td')) {
    const paragraphs = [...cell.querySelectorAll(':scope > p')]
    if (paragraphs.length === 0) continue
    cell.innerHTML = paragraphs
      .map((p) => p.innerHTML.trim())
      .filter(Boolean)
      .join('<br />')
  }

  return doc.body.innerHTML
}

export function markdownToHtml(markdown: string): string {
  if (!markdown.trim()) return ''
  return parseMarkdownWithHeadingIds(markdown)
}

export function htmlToMarkdown(html: string): string {
  if (!html.trim() || html === '<p></p>') return ''
  return turndown.turndown(prepareHtmlForMarkdown(html)).trim()
}
