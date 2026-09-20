import type { Editor } from '@tiptap/react'
import type { HeadingLevel } from '@/store/useEditorStore'
import { markdownToHtml } from '@/lib/markdown'

export function getActiveBlockLabel(editor: Editor): string {
  if (editor.isActive('heading', { level: 1 })) return 'Heading 1'
  if (editor.isActive('heading', { level: 2 })) return 'Heading 2'
  if (editor.isActive('heading', { level: 3 })) return 'Heading 3'
  if (editor.isActive('heading', { level: 4 })) return 'Heading 4'
  if (editor.isActive('heading', { level: 5 })) return 'Heading 5'
  if (editor.isActive('heading', { level: 6 })) return 'Heading 6'
  if (editor.isActive('blockquote')) return 'Blockquote'
  if (editor.isActive('codeBlock')) return 'Code Block'
  return 'Paragraph'
}

export function runFormatAction(editor: Editor, action: string) {
  const chain = editor.chain().focus()

  switch (action) {
    case 'bold': chain.toggleBold().run(); break
    case 'italic': chain.toggleItalic().run(); break
    case 'strike': chain.toggleStrike().run(); break
    case 'code': chain.toggleCode().run(); break
    case 'link': chain.setLink({ href: 'https://' }).run(); break
    case 'bulletList': chain.toggleBulletList().run(); break
    case 'orderedList': chain.toggleOrderedList().run(); break
    case 'blockquote': chain.toggleBlockquote().run(); break
    case 'codeBlock': chain.toggleCodeBlock().run(); break
    case 'paragraph': chain.setParagraph().run(); break
    case 'horizontalRule': chain.setHorizontalRule().run(); break
    case 'undo': editor.commands.undo(); break
    case 'redo': editor.commands.redo(); break
    default:
      if (action.startsWith('heading-')) {
        const level = Number(action.replace('heading-', '')) as HeadingLevel
        if (level >= 1 && level <= 6) chain.setHeading({ level }).run()
      }
  }
}

export function createEditorCommands(editor: Editor) {
  return {
    undo: () => editor.commands.undo(),
    redo: () => editor.commands.redo(),
    cut: () => document.execCommand('cut'),
    copy: () => document.execCommand('copy'),
    paste: () => document.execCommand('paste'),
    bold: () => editor.chain().focus().toggleBold().run(),
    italic: () => editor.chain().focus().toggleItalic().run(),
    strike: () => editor.chain().focus().toggleStrike().run(),
    code: () => editor.chain().focus().toggleCode().run(),
    link: () => editor.chain().focus().setLink({ href: 'https://' }).run(),
    bulletList: () => editor.chain().focus().toggleBulletList().run(),
    orderedList: () => editor.chain().focus().toggleOrderedList().run(),
    blockquote: () => editor.chain().focus().toggleBlockquote().run(),
    codeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
    setParagraph: () => editor.chain().focus().setParagraph().run(),
    setHeading: (level: HeadingLevel) => editor.chain().focus().setHeading({ level }).run(),
    insertTable: (rows = 3, cols = 3, withHeaderRow = true) =>
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run(),
    addRowBefore: () => editor.chain().focus().addRowBefore().run(),
    addRowAfter: () => editor.chain().focus().addRowAfter().run(),
    deleteRow: () => editor.chain().focus().deleteRow().run(),
    addColumnBefore: () => editor.chain().focus().addColumnBefore().run(),
    addColumnAfter: () => editor.chain().focus().addColumnAfter().run(),
    deleteColumn: () => editor.chain().focus().deleteColumn().run(),
    deleteTable: () => editor.chain().focus().deleteTable().run(),
    toggleHeaderRow: () => editor.chain().focus().toggleHeaderRow().run(),
    toggleHeaderColumn: () => editor.chain().focus().toggleHeaderColumn().run(),
    mergeCells: () => editor.chain().focus().mergeCells().run(),
    splitCell: () => editor.chain().focus().splitCell().run(),
    insertImage: () => {
      const url = window.prompt('Image URL')
      if (url) editor.chain().focus().setImage({ src: url }).run()
    },
    insertHorizontalRule: () => editor.chain().focus().setHorizontalRule().run(),
    insertTableOfContents: (markdown: string) => {
      const html = markdownToHtml(markdown)
      editor.chain().focus().insertContent(`${html}<p></p>`).run()
    },
    getBlockLabel: () => getActiveBlockLabel(editor),
  }
}
