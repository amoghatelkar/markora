import { useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useAppStore, useActiveDocument } from '@/store/useAppStore'
import { Toolbar } from '@/components/shell/Toolbar'
import './Editor.css'

export function Editor() {
  const doc = useActiveDocument()
  const editorWidth = useAppStore((s) => s.editorWidth)
  const showMarkdownSource = useAppStore((s) => s.showMarkdownSource)
  const updateDocumentContent = useAppStore((s) => s.updateDocumentContent)
  const zenMode = useAppStore((s) => s.zenMode)

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
    content: doc?.content ?? '',
    editorProps: {
      attributes: {
        class: 'editor-prose',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (doc) updateDocumentContent(doc.id, ed.getHTML())
    },
  })

  useEffect(() => {
    if (editor && doc && editor.getHTML() !== doc.content) {
      editor.commands.setContent(doc.content, false)
    }
  }, [doc?.id, editor])

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
