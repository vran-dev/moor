import { Node } from 'prosemirror-model'
import {
    Decoration,
    DecorationSource,
    EditorView,
    NodeView
} from 'prosemirror-view'
import { Root, createRoot } from 'react-dom/client'
import { CodeMirrorComponent } from './components'

export class CodeMirrorNodeAttrs {
    lineWrap: boolean = false
    language: string = 'text'
    layout: string = 'SplitVertical'
    data: string = ''
}

export interface SelectOption {
    anchor: number
    head: number
}

export class CodeMirrorNodeView implements NodeView {
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
        this.root = createRoot(hole)
        this.renderReactComponent({})
    }

    renderReactComponent(props: { selection?: SelectOption }): void {
        this.root.render(
            <CodeMirrorComponent
                node={this.node}
                getPos={this.getPos}
                view={this.editorView}
                selection={props.selection}
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
        this.renderReactComponent({})
        return true
    }

    destroy(): void {
        setTimeout(() => {
            this.root.unmount()
        })
    }

    setSelection(anchor: number, head: number): void {
        this.renderReactComponent({
            selection: {
                anchor: anchor,
                head: head
            }
        })
    }

    stopEvent(): boolean {
        return true
    }
}
