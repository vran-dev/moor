import { LexicalEditor } from 'lexical'

export function focusEditorDom(editor: LexicalEditor): void {
  const activeElement = document.activeElement
  const rootElement = editor.getRootElement() as HTMLDivElement
  if (rootElement !== null && (activeElement === null || !rootElement.contains(activeElement))) {
    // Note: preventScroll won't work in Webkit.
    rootElement.focus({ preventScroll: true })
  }
}
