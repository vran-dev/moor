import { Node } from 'prosemirror-model'
import {
    Decoration,
    DecorationSource,
    EditorView,
    NodeView
} from 'prosemirror-view'
import { Root, createRoot } from 'react-dom/client'
import { NodeSelection } from 'prosemirror-state'
import { ExcalidrawComponent } from './component/ExcalidrawComponent'

export class ExcalidrawNodeView implements NodeView {
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
        this.root.render(
            <ExcalidrawComponent
                node={this.node}
                getPos={this.getPos}
                view={this.editorView}
            />
        )
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
    stopEvent(event: Event) {
        const eventType = event.type

        // if mod+enter, jump to next node or create new paragraph node
        if (eventType === 'mousedown') {
            // right click
            if (event.button === 2) {
                event.preventDefault()
                return true
            }
        }

        // ignore keydown and keyup events above Excalidraw canvas
        if (eventType === 'keydown') {
            const keyboardEvent = event as KeyboardEvent
            const jump = (): void | false => {
                const view = this.editorView
                // if (!createParagraphNear(view.state, view.dispatch)) {
                //     return false
                // }
                view.focus()
            }
            // mac use command+enter
            if (keyboardEvent.metaKey && keyboardEvent.key === 'Enter') {
                jump()
            }
            // windows/linux use ctrl+enter
            if (keyboardEvent.ctrlKey && keyboardEvent.key === 'Enter') {
                jump()
            }
            return true
        }

        if (eventType === 'keyup') {
            event.preventDefault()
            return true
        }

        // ignore drag events above Excalidraw canvas when target is not a drag handle
        const isDragEvent = event.type === 'dragstart'
        const target = event.target
        if (isDragEvent && target && target instanceof HTMLElement) {
            const ele = target as HTMLElement
            if (!ele.hasAttribute('data-drag-handle')) {
                event.preventDefault()
                return true
            } else {
                return false
            }
        }

        // select current node
        // if (event.type === 'mousedown') {
        //     const mouseEvent = event as MouseEvent
        //     const view = this.editorView
        //     const pos = view.posAtCoords({
        //         left: mouseEvent.clientX,
        //         top: mouseEvent.clientY
        //     })
        //     if (pos) {
        //         const selection = NodeSelection.create(view.state.doc, pos.pos)
        //         const transaction = view.state.tr.setSelection(selection)
        //         view.dispatch(transaction)
        //     }
        // }
        return true
    }

    destroy(): void {
        setTimeout(() => {
            this.root.unmount()
        })
    }
}
