import { useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useAppStore, useActiveDocument } from '@/store/useAppStore'
import { useEditorStore } from '@/store/useEditorStore'
import { markdownToHtml, htmlToMarkdown } from '@/lib/markdown'
import { Toolbar } from '@/components/shell/Toolbar'
import './Editor.css'

export function Editor() {
  const doc = useActiveDocument()
  const editorWidth = useAppStore((s) => s.editorWidth)
  const showMarkdownSource = useAppStore((s) => s.showMarkdownSource)
  const updateDocumentContent = useAppStore((s) => s.updateDocumentContent)
  const zenMode = useAppStore((s) => s.zenMode)
  const registerCommands = useEditorStore((s) => s.registerCommands)
  const unregisterCommands = useEditorStore((s) => s.unregisterCommands)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'Start writing…',
      }),
    ],
    content: markdownToHtml(doc?.content ?? ''),
    editorProps: {
      attributes: {
        class: 'editor-prose',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (doc) updateDocumentContent(doc.id, htmlToMarkdown(ed.getHTML()))
    },
  })

  const handleFormat = useCallback(
    (action: string) => {
      if (!editor) return
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
        case 'undo': editor.commands.undo(); break
        case 'redo': editor.commands.redo(); break
      }
    },
    [editor]
  )

  useEffect(() => {
    if (!editor) return

    registerCommands({
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
    })

    return () => unregisterCommands()
  }, [editor, registerCommands, unregisterCommands])

  useEffect(() => {
    if (!editor || !doc || showMarkdownSource) return
    editor.commands.setContent(markdownToHtml(doc.content), false)
  }, [doc?.id, showMarkdownSource, editor])

  useEffect(() => {
    if (!editor || !doc || !showMarkdownSource) return
    const md = htmlToMarkdown(editor.getHTML())
    if (md !== doc.content) {
      updateDocumentContent(doc.id, md)
    }
  }, [showMarkdownSource])

  if (!doc) return null

  const widthVar = `--editor-width-${editorWidth}`

  return (
    <div className={`editor ${zenMode ? 'editor--zen' : ''}`}>
      <Toolbar onFormat={handleFormat} />
      <div className="editor-scroll">
        <div
          className="editor-canvas"
          style={{ maxWidth: `var(${widthVar})` }}
        >
          {showMarkdownSource ? (
            <textarea
              className="editor-source"
              value={doc.content}
              onChange={(e) => updateDocumentContent(doc.id, e.target.value)}
              spellCheck={false}
            />
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>
      </div>
    </div>
  )
}
