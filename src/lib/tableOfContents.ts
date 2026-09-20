import { uniqueHeadingSlug, plainHeadingText } from '@/lib/headingSlugs'

export interface TocHeading {
  level: number
  text: string
  slug: string
}

const TOC_HEADING_RE = /^table of contents$/i

export function extractTocHeadings(markdown: string): TocHeading[] {
  const used = new Map<string, number>()
  const items: TocHeading[] = []

  for (const line of markdown.split('\n')) {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (!match) continue

    const level = match[1].length
    const text = plainHeadingText(match[2].trim())
    if (!text || TOC_HEADING_RE.test(text)) continue

    const slug = uniqueHeadingSlug(text, used)
    items.push({ level, text, slug })
  }

  return items
}

export function buildTableOfContentsMarkdown(headings: TocHeading[]): string {
  if (headings.length === 0) return ''

  const lines = ['## Table of contents', '']

  for (const h of headings) {
    const indent = ' '.repeat(Math.max(0, (h.level - 1) * 2))
    lines.push(`${indent}- [${h.text}](#${h.slug})`)
  }

  return `${lines.join('\n')}\n`
}
