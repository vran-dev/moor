import { Attrs } from '@tiptap/pm/model'
import { EditorView } from '@tiptap/pm/view'

export default class ProsemirrorNodes {
  static updateNodeAttributes(view: EditorView, getPos: () => number, attrs?: Attrs | null): void {
    const { state, dispatch } = view
    const transaction = state.tr.setNodeMarkup(getPos(), undefined, attrs)
    state.tr.setNodeMarkup(getPos(), undefined, attrs)
    dispatch(transaction)
  }
}
