import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { uniqueHeadingSlug } from '@/lib/headingSlugs'

const headingIdsPluginKey = new PluginKey('headingIds')

function createHeadingIdsPlugin() {
  return new Plugin({
    key: headingIdsPluginKey,
    appendTransaction(transactions, _oldState, newState) {
      if (!transactions.some((tr) => tr.docChanged)) return null

      const used = new Map<string, number>()
      let tr = newState.tr
      let modified = false

      newState.doc.descendants((node, pos) => {
        if (node.type.name !== 'heading') return
        const id = uniqueHeadingSlug(node.textContent, used)
        if (node.attrs.id !== id) {
          tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, id })
          modified = true
        }
      })

      if (!modified) return null
      tr.setMeta('addToHistory', false)
      return tr
    },
  })
}

/** Keeps `id` on headings in the WYSIWYG editor so in-document TOC links work. */
export const HeadingIds = Extension.create({
  name: 'headingIds',

  addGlobalAttributes() {
    return [
      {
        types: ['heading'],
        attributes: {
          id: {
            default: null,
            parseHTML: (element) => element.getAttribute('id'),
            renderHTML: (attributes) => {
              if (!attributes.id) return {}
              return { id: attributes.id }
            },
          },
        },
      },
    ]
  },

  addProseMirrorPlugins() {
    return [createHeadingIdsPlugin()]
  },
})
