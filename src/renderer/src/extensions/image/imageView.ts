import Resizeable, { ResizeableHolder } from '@renderer/common/resizeable'
import Zoomable from '@renderer/common/zoomable'
import { Node } from 'prosemirror-model'
import { NodeView, EditorView } from 'prosemirror-view'
import { v4 as uuidv4 } from 'uuid'

export class ImageView implements NodeView {
  node: Node

  dom: HTMLElement

  img: HTMLImageElement

  view: EditorView

  getPos: () => number

  width: string | number | null

  height: string | number | null

  private id: string

  private resizeableHolder: ResizeableHolder

  constructor(node: Node, view: EditorView, getPos: () => number) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.width = node.attrs.width
    this.height = node.attrs.height
    this.id = node.attrs.id ? node.attrs.id : uuidv4()

    this.img = document.createElement('img')
    this.img.classList.add('not-prose')
    this.img.src = node.attrs.src
    this.img.alt = node.attrs.alt
    this.img.style.width = '100%'

    this.resizeableHolder = Resizeable.wrap(
      Zoomable.wrap(this.img),
      (width, height) => {
        const { state, dispatch } = this.view
        const attrs = {
          src: this.node.attrs.src,
          alt: 'hello world',
          id: this.id,
          width: width,
          height: height
        }

        const transaction = state.tr.setNodeMarkup(this.getPos(), undefined, attrs)
        state.tr.setNodeMarkup(this.getPos(), undefined, attrs)
        dispatch(transaction)
      },
      this.width,
      this.height
    )
    this.dom = this.resizeableHolder.container
  }

  update(
    node: Node,
    decorations: readonly Decoration[],
    innerDecorations: DecorationSource
  ): boolean {
    if (node.type !== this.node.type) {
      return false
    }
    if (node.attrs.src !== this.node.attrs.src) {
      return false
    }
    if (!node.attrs.id || node.attrs.id !== this.id) {
      return false
    }
    this.node = node
    return true
  }

  ignoreMutation(): boolean {
    return true
  }

  destroy(): void {
    this.resizeableHolder.destroy()
  }
}
