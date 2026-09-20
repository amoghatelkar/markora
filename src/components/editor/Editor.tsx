import { useCallback, useEffect, useRef, type CSSProperties } from 'react'
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
import { TableBubbleMenu } from '@/components/editor/TableBubbleMenu'
import { TableInsertPicker } from '@/components/editor/TableInsertPicker'
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
  const sourceRef = useRef<HTMLTextAreaElement>(null)

  const syncSourceHeight = useCallback(() => {
    const el = sourceRef.current
    if (!el) return
    el.style.height = 'auto'
    const min = Math.max(320, Math.floor(window.innerHeight * 0.35))
    el.style.height = `${Math.max(el.scrollHeight, min)}px`
  }, [])

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

  useEffect(() => {
    if (!showMarkdownSource) return
    syncSourceHeight()
  }, [showMarkdownSource, doc?.content, editorZoom, syncSourceHeight])

  useEffect(() => {
    if (!showMarkdownSource) return
    const onResize = () => syncSourceHeight()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [showMarkdownSource, syncSourceHeight])

  if (!doc) return null

  const widthVar = `--editor-width-${editorWidth}`
  const canvasStyle: CSSProperties = {
    maxWidth: `var(${widthVar})`,
    zoom: editorZoom / 100,
  }

  return (
    <div className={`editor ${zenMode ? 'editor--zen' : ''} ${showMarkdownSource ? 'editor--source' : ''}`}>
      {!showMarkdownSource && (
        <>
          <TableInsertPicker variant="headless" />
          <Toolbar onFormat={handleFormat} />
        </>
      )}
      <div className="editor-scroll">
        <div className="editor-canvas" style={canvasStyle}>
          <article className="editor-document">
            {showMarkdownSource ? (
              <div className="editor-source-wrap">
                <div className="editor-source-label">Markdown</div>
                <textarea
                  ref={sourceRef}
                  className="editor-source"
                  value={doc.content}
                  onChange={(e) => {
                    updateDocumentContent(doc.id, e.target.value)
                    syncSourceHeight()
                  }}
                  spellCheck={false}
                  aria-label="Markdown source"
                />
              </div>
            ) : (
              <>
                <TableBubbleMenu editor={editor} />
                <EditorContent editor={editor} />
              </>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}
