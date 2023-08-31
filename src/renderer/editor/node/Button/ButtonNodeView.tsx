import { Node } from 'prosemirror-model'
import {
    Decoration,
    DecorationSource,
    EditorView,
    NodeView
} from 'prosemirror-view'
import ReactDOM, { createPortal } from 'react-dom'
import { ButtonComponent } from './ButtonComponent'
import { Root, createRoot } from 'react-dom/client'

export class ButtonNodeView implements NodeView {
    node: Node
    getPos: () => number
    editorView: EditorView
    dom: HTMLDivElement
    root: Root

    constructor(node: Node, view: EditorView, getPos: () => number) {
        this.node = node
        this.getPos = getPos
        this.editorView = view
        // create react component wrapper
        const hole = document.createElement('div')
        this.dom = hole
        // const component = createPortal(<ButtonComponent />, hole)
        this.root = createRoot(hole)
        this.renderReactComponent()
    }

    renderReactComponent(): void {
        this.root.render(<ButtonComponent />)
    }

    update(
        node: Node,
        decorations: readonly Decoration[],
        innerDecorations: DecorationSource
    ): boolean {
        if (node.type != this.node.type) {
            return false
        }
        this.node = node
        this.renderReactComponent()
        return true
    }

    destroy(): void {
        setTimeout(() => {
            this.root.unmount()
        })
    }
}
