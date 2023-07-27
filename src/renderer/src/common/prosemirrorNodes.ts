import { Attrs, Node, ResolvedPos } from '@tiptap/pm/model'
import { EditorView } from '@tiptap/pm/view'

export default class ProsemirrorNodes {
  static updateNodeAttributes(view: EditorView, getPos: () => number, attrs?: Attrs | null): void {
    const { state, dispatch } = view
    const transaction = state.tr.setNodeMarkup(getPos(), undefined, attrs)
    dispatch(transaction)
  }

  static hasAncestorNode(view: EditorView, getPos: () => number, nodeType: string): boolean {
    const { state } = view
    const pos = getPos()
    const $pos = state.doc.resolve(pos)
    if (!$pos) {
      return false
    }
    for (let i = 0; i < $pos.depth; i++) {
      if ($pos.node(i).type.name === nodeType) {
        return true
      }
    }
    return false
  }

  static getAncestorNodePos(
    view: EditorView,
    getPos: () => number,
    nodeType: string
  ): number | null {
    const { state } = view
    const $pos = state.doc.resolve(getPos())
    if (!$pos) {
      return null
    }
    let parent: Node | null = null
    for (let i = 0; i < $pos.depth; i++) {
      if ($pos.node(i).type.name === nodeType) {
        parent = $pos.node(i)
      }
    }
    if (parent != null) {
      let pos: number | null = null
      view.state.doc.descendants((node, nodePos) => {
        if (node === parent) {
          pos = nodePos
          return false
        }
      })
      return pos
    } else {
      return 0
    }
    return null
  }
}
