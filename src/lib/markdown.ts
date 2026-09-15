import { marked } from 'marked'
import TurndownService from 'turndown'

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

turndown.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => `~~${content}~~`,
})

marked.setOptions({
  gfm: true,
  breaks: false,
})

export function markdownToHtml(markdown: string): string {
  if (!markdown.trim()) return ''
  return marked.parse(markdown, { async: false }) as string
}

export function htmlToMarkdown(html: string): string {
  if (!html.trim() || html === '<p></p>') return ''
  return turndown.turndown(html).trim()
}
