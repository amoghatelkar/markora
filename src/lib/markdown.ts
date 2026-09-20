import TurndownService from 'turndown'
import { parseMarkdownWithHeadingIds } from '@/lib/markedHeadingIds'

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

turndown.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => `~~${content}~~`,
})

export function markdownToHtml(markdown: string): string {
  if (!markdown.trim()) return ''
  return parseMarkdownWithHeadingIds(markdown)
}

export function htmlToMarkdown(html: string): string {
  if (!html.trim() || html === '<p></p>') return ''
  return turndown.turndown(html).trim()
}
