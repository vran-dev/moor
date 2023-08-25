import { $getSelection, $isNodeSelection, $isRangeSelection, LexicalEditor } from 'lexical'

export function isMultipleSelectino(editor: LexicalEditor | null): boolean {
  if (!editor || !editor.getEditorState()) {
    return false
  }
  return editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchor = selection.anchor
      const focus = selection.focus
      if (anchor.key === focus.key && anchor.offset === focus.offset) {
        return false
      }
    }

    if ($isNodeSelection(selection)) {
      const nodes = selection.getNodes()
      if (nodes.length <= 1) {
        return false
      }
    }

    console.log(selection)
    return true
  })
}
