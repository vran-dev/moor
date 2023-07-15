import { EditorView } from '@tiptap/pm/view'
import { Selection } from '@tiptap/pm/state'

export const getSelectionText = (view: EditorView): string => {
  const range: Selection = view.state.selection
  const { from, to } = range
  const searchKeyword = view.state.doc.textBetween(from, to)
  return searchKeyword
}
