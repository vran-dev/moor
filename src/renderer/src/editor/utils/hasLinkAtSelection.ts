import { $getSelection, $isRangeSelection, LexicalEditor, RangeSelection, TextNode } from 'lexical'
import { $isLinkNode } from '@lexical/link'

export function hasLinkInSelection(editor: LexicalEditor): boolean {
  return editor.getEditorState().read<boolean>(() => {
    if (editor.isComposing()) {
      return false
    }
    const selection = $getSelection()
    const nativeSelection = window.getSelection()
    const rootElement = editor.getRootElement()

    if (nativeSelection !== null) {
      if (!$isRangeSelection(selection)) {
        return false
      }
      if (rootElement === null) {
        return false
      }
      if (!rootElement.contains(nativeSelection.anchorNode)) {
        return false
      }
    }

    const rangeSelection = selection as RangeSelection
    return (
      rangeSelection.getNodes().findIndex((node) => {
        if ($isLinkNode(node)) {
          return true
        }
        if (node instanceof TextNode) {
          return $isLinkNode(node.getParent())
        }
        return false
      }) !== -1
    )
  })
}
