import type { OutlineItem } from '@/types'

export function extractOutline(content: string): OutlineItem[] {
  const items: OutlineItem[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      items.push({
        id: `heading-${items.length}`,
        level: match[1].length,
        text: match[2].trim(),
      })
    }
  }

  return items
}
