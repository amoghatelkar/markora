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
import { HeadingIds } from '@/lib/tiptapHeadingIds'
import { runFormatAction, createEditorCommands, getActiveBlockLabel } from '@/lib/editorFormat'
import { Toolbar } from '@/components/shell/Toolbar'
import { TableBubbleMenu } from '@/components/editor/TableBubbleMenu'
import { TableInsertPicker } from '@/components/editor/TableInsertPicker'
import { findHeadingLineCharRange } from '@/lib/tableOfContents'
import {
  flashHeadingElement,
  OUTLINE_FLASH_MS,
  scrollElementIntoEditorView,
} from '@/lib/outlineNavigation'
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
  const registerSourceInsertText = useEditorStore((s) => s.registerSourceInsertText)
  const registerScrollToHeading = useEditorStore((s) => s.registerScrollToHeading)
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
      HeadingIds,
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
    registerSourceInsertText((text) => {
      const el = sourceRef.current
      const activeId = useAppStore.getState().activeDocumentId
      if (!el || !activeId) return
      const activeDoc = useAppStore.getState().documents.find((d) => d.id === activeId)
      if (!activeDoc) return
      const start = el.selectionStart ?? activeDoc.content.length
      const end = el.selectionEnd ?? start
      const before = activeDoc.content.slice(0, start)
      const after = activeDoc.content.slice(end)
      const needsGap = before.length > 0 && !before.endsWith('\n\n')
      const insertion = `${needsGap ? '\n\n' : ''}${text}`
      updateDocumentContent(activeId, before + insertion + after)
      requestAnimationFrame(() => {
        const pos = start + insertion.length
        el.focus()
        el.setSelectionRange(pos, pos)
        syncSourceHeight()
      })
    })
    return () => registerSourceInsertText(null)
  }, [registerSourceInsertText, updateDocumentContent, syncSourceHeight])

  useEffect(() => {
    const scrollToHeading = (slug: string) => {
      const state = useAppStore.getState()
      const activeDoc = state.documents.find((d) => d.id === state.activeDocumentId)
      if (!activeDoc) return

      if (state.showMarkdownSource) {
        const el = sourceRef.current
        const range = findHeadingLineCharRange(activeDoc.content, slug)
        if (!el || !range) return
        el.focus()
        el.setSelectionRange(range.start, range.end)
        const linesBefore = activeDoc.content.slice(0, range.start).split('\n').length - 1
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 22
        el.scrollTop = Math.max(0, linesBefore * lineHeight - el.clientHeight / 2)
        window.setTimeout(() => {
          const caret = el.selectionEnd ?? range.end
          el.setSelectionRange(caret, caret)
        }, OUTLINE_FLASH_MS)
        return
      }

      if (!editor) return
      const heading = editor.view.dom.querySelector(
        `#${CSS.escape(slug)}`
      ) as HTMLElement | null
      if (!heading) return

      scrollElementIntoEditorView(heading)
      flashHeadingElement(heading)

      const pos = editor.view.posAtDOM(heading, 0)
      if (pos >= 0) {
        editor.chain().focus().setTextSelection(pos + 1).run()
      }
    }

    registerScrollToHeading(scrollToHeading)
    return () => registerScrollToHeading(null)
  }, [editor, registerScrollToHeading])

  useEffect(() => {
    if (!editor || !doc || showMarkdownSource) return
    editor.commands.setContent(markdownToHtml(doc.content), false)
    setBlockLabel(getActiveBlockLabel(editor))
  }, [doc?.id, showMarkdownSource, editor, setBlockLabel])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!showMarkdownSource)
  }, [editor, showMarkdownSource])

  useEffect(() => {
    if (!editor || !doc || !showMarkdownSource) return
    const md = htmlToMarkdown(editor.getHTML())
    if (md !== doc.content) {
      updateDocumentContent(doc.id, md)
    }
  }, [showMarkdownSource, editor, doc?.id, updateDocumentContent])

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
      <TableBubbleMenu editor={editor} enabled={!showMarkdownSource} />
      <div className="editor-scroll">
        <div className="editor-canvas" style={canvasStyle}>
          <article className="editor-document">
            <div
              className="editor-source-wrap"
              hidden={!showMarkdownSource}
              aria-hidden={!showMarkdownSource}
            >
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
                tabIndex={showMarkdownSource ? 0 : -1}
              />
            </div>
            <div
              className="editor-wysiwyg-wrap"
              hidden={showMarkdownSource}
              aria-hidden={showMarkdownSource}
            >
              <EditorContent editor={editor} />
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
