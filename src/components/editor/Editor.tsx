import { useCallback, useEffect, type CSSProperties } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Placeholder from '@tiptap/extension-placeholder'
import { useAppStore, useActiveDocument } from '@/store/useAppStore'
import { useEditorStore } from '@/store/useEditorStore'
import { markdownToHtml, htmlToMarkdown } from '@/lib/markdown'
import { runFormatAction, createEditorCommands, getActiveBlockLabel } from '@/lib/editorFormat'
import { Toolbar } from '@/components/shell/Toolbar'
import './Editor.css'

export function Editor() {
  const doc = useActiveDocument()
  const editorWidth = useAppStore((s) => s.editorWidth)
  const editorZoom = useAppStore((s) => s.editorZoom)
  const showMarkdownSource = useAppStore((s) => s.showMarkdownSource)
  const updateDocumentContent = useAppStore((s) => s.updateDocumentContent)
  const zenMode = useAppStore((s) => s.zenMode)
  const registerCommands = useEditorStore((s) => s.registerCommands)
  const unregisterCommands = useEditorStore((s) => s.unregisterCommands)
  const setBlockLabel = useEditorStore((s) => s.setBlockLabel)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
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
      setBlockLabel(getActiveBlockLabel(ed))
    },
    onSelectionUpdate: ({ editor: ed }) => {
      setBlockLabel(getActiveBlockLabel(ed))
    },
  })

  const handleFormat = useCallback(
    (action: string) => {
      if (!editor) return
      runFormatAction(editor, action)
      setBlockLabel(getActiveBlockLabel(editor))
    },
    [editor, setBlockLabel]
  )

  useEffect(() => {
    if (!editor) return

    const commands = createEditorCommands(editor)
    registerCommands(commands)
    setBlockLabel(commands.getBlockLabel())

    return () => unregisterCommands()
  }, [editor, registerCommands, unregisterCommands, setBlockLabel])

  useEffect(() => {
    if (!editor || !doc || showMarkdownSource) return
    editor.commands.setContent(markdownToHtml(doc.content), false)
    setBlockLabel(getActiveBlockLabel(editor))
  }, [doc?.id, showMarkdownSource, editor, setBlockLabel])

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
    <div className={`editor ${zenMode ? 'editor--zen' : ''} ${showMarkdownSource ? 'editor--source' : ''}`}>
      {!showMarkdownSource && <Toolbar onFormat={handleFormat} />}
      <div className="editor-scroll">
        <div
          className="editor-canvas"
          style={{ maxWidth: `var(${widthVar})` }}
        >
          <article
            className="editor-document"
            style={{ '--editor-zoom': editorZoom / 100 } as CSSProperties}
          >
            {showMarkdownSource ? (
              <div className="editor-source-wrap">
                <div className="editor-source-label">Markdown</div>
                <textarea
                  className="editor-source"
                  value={doc.content}
                  onChange={(e) => updateDocumentContent(doc.id, e.target.value)}
                  spellCheck={false}
                  aria-label="Markdown source"
                />
              </div>
            ) : (
              <EditorContent editor={editor} />
            )}
          </article>
        </div>
      </div>
    </div>
  )
}
