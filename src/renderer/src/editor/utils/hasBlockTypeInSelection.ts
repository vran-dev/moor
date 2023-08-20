import {
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
  LexicalNode,
  RangeSelection
} from 'lexical'

export function hasBlockTypeInSelection(
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
        const ele = node.getTopLevelElement()
        if (predicate(ele)) {
          return true
        }
        return false
      }) !== -1
    )
  })
}
