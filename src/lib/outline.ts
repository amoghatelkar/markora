import type { OutlineItem } from '@/types'
import { extractTocHeadings } from '@/lib/tableOfContents'

export function extractOutline(content: string): OutlineItem[] {
  return extractTocHeadings(content).map((heading, index) => ({
    id: `heading-${index}`,
    level: heading.level,
    text: heading.text,
    slug: heading.slug,
  }))
}
