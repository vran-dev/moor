import { Node } from 'prosemirror-model'
import { NodeView, EditorView } from 'prosemirror-view'
import { v4 as uuidv4 } from 'uuid'

export class ImageView implements NodeView {
  node: Node

  dom: HTMLElement

  leftSide: HTMLElement

  rightSide: HTMLElement

  img: HTMLImageElement

  view: EditorView

  getPos: () => number

  width: string | number | null

  height: string | number | null

  private minWidth = 36

  private initialX: number | undefined

  private initialY: number | undefined

  private aspectRatio: number | undefined

  private id: string

  constructor(node: Node, view: EditorView, getPos: () => number) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.width = node.attrs.width
    this.height = node.attrs.height
    this.id = node.attrs.id ? node.attrs.id : uuidv4()

    // init dom
    this.dom = document.createElement('div')
    this.dom.style.position = 'relative'
    this.dom.classList.add('image-container') // todo delete
    if (node.attrs.width) {
      this.dom.style.width = node.attrs.width
    }
    if (node.attrs.height) {
      this.dom.style.height = node.attrs.height
    }
    this.img = document.createElement('img')
    this.img.classList.add('not-prose')
    this.img.src = node.attrs.src
    this.img.alt = node.attrs.alt
    this.img.style.width = '100%'
    this.dom.appendChild(this.img)

    this.leftSide = document.createElement('div')
    this.leftSide.addEventListener('mousedown', (event) => {
      event.preventDefault()
      this.leftSide.classList.add('resizing')
      this.handleMouseDown(event)
    })
    this.dom.appendChild(this.leftSide)

    this.rightSide = document.createElement('div')
    this.rightSide.addEventListener('mousedown', (event) => {
      event.preventDefault()
      this.rightSide.classList.add('resizing')
      this.handleMouseDown(event)
    })
    this.dom.appendChild(this.rightSide)

    this.dom.addEventListener('mouseenter', (event) => {
      event.preventDefault()
      this.leftSide.classList.add('resize-handle', 'resize-handle-left')
      this.rightSide.classList.add('resize-handle', 'resize-handle-right')
    })
    this.dom.addEventListener('mouseleave', (event) => {
      event.preventDefault()
      this.leftSide.classList.remove('resize-handle', 'resize-handle-left')
      this.rightSide.classList.remove('resize-handle', 'resize-handle-right')
    })

    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  }

  private handleMouseDown = (event: MouseEvent): void => {
    event.preventDefault()
    this.initialX = event.clientX
    this.initialY = event.clientY
    this.initAspectRatio()
  }
  private handleMouseUp = (event: MouseEvent): void => {
    if (
      this.rightSide.classList.contains('resizing') ||
      this.leftSide.classList.contains('resizing')
    ) {
      event.preventDefault()
      this.rightSide.classList.remove('resizing')
      this.leftSide.classList.remove('resizing')
      this.updateNodeAttrs()
    }
  }

  private handleMouseMove = (event: MouseEvent): void => {
    let element: HTMLElement
    if (this.leftSide.classList.contains('resizing')) {
      element = this.leftSide
    } else if (this.rightSide.classList.contains('resizing')) {
      element = this.rightSide
    } else {
      return
    }
    event.preventDefault()
    let deltaX: number
    if (element == this.leftSide) {
      deltaX = -(event.clientX - this.initialX)
    } else {
      deltaX = event.clientX - this.initialX
    }
    this.initialX = event.clientX
    this.initialY = event.clientY
    const newWidth = this.dom.offsetWidth + deltaX
    if (newWidth < this.minWidth) {
      return
    }
    const newHeight = newWidth / this.aspectRatio
    this.dom.style.width = `${newWidth}px`
    this.dom.style.height = `${newHeight}px`
    this.height = `${newHeight}px`
    this.width = `${newWidth}px`
  }

  private updateNodeAttrs = (): void => {
    const { state, dispatch } = this.view
    const attrs = {
      src: this.node.attrs.src,
      alt: 'hello world',
      id: this.id,
      width: this.width,
      height: this.height
    }

    const transaction = state.tr.setNodeMarkup(this.getPos(), undefined, attrs)
    state.tr.setNodeMarkup(this.getPos(), undefined, attrs)
    dispatch(transaction)
  }

  private initAspectRatio(): void {
    let domHeight: number
    if (this.dom.offsetHeight > 0) {
      domHeight = this.dom.offsetHeight
    } else {
      domHeight = 1
    }
    this.aspectRatio = this.dom.offsetWidth / domHeight
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
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  }
}
