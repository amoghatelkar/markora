import { Marked, Renderer } from 'marked'
import type { Tokens } from 'marked'
import { uniqueHeadingSlug } from '@/lib/headingSlugs'

export function parseMarkdownWithHeadingIds(markdown: string): string {
  const used = new Map<string, number>()

  const renderer = new Renderer()
  renderer.heading = function heading({ tokens, depth }: Tokens.Heading) {
    const html = this.parser.parseInline(tokens)
    const plain = html.replace(/<[^>]+>/g, '').trim()
    const id = uniqueHeadingSlug(plain, used)
    return `<h${depth} id="${id}">${html}</h${depth}>\n`
  }

  const instance = new Marked({ gfm: true, breaks: false })
  instance.use({ renderer })
  return instance.parse(markdown, { async: false }) as string
}
