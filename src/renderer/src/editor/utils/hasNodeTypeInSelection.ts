import {
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
  TextNode
} from 'lexical'

export function hasNodeTypeInSelection(
  editor: LexicalEditor,
  predicate: (node: LexicalNode | null) => boolean
): boolean {
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
        if (predicate(node)) {
          return true
        }
        if (node instanceof TextNode) {
          return predicate(node.getParent())
        }
        return false
      }) !== -1
    )
  })
}
