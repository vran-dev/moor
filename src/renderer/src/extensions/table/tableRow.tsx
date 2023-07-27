/* eslint-disable @typescript-eslint/explicit-function-return-type */
import TableRow from '@tiptap/extension-table-row'
import { Editor } from '@tiptap/react'
import { Node } from 'prosemirror-model'
import { Decoration, DecorationSource, NodeView } from 'prosemirror-view'

export const CustomTableRow = TableRow.extend({

  addAttributes() {
    return {
      className: {
        default: null,
        parseHTML: element => {
          return {
            className: element.getAttribute('class')
          }
        },
        renderHTML: attributes => {
          return {
            class: attributes.className
          }
        }
      }
    }
  },
  addNodeView() {
    return (props): NodeView => {
      return new TableRowNodeView(this.editor, props.node, props.getPos)
    }
  }
})

class TableRowNodeView implements NodeView {
  editor: Editor
  dom: HTMLElement
  contentDOM?: HTMLElement | null | undefined
  node: Node
  getPos: () => number

  constructor(editor: Editor, node: Node,  getPos: () => number) {
    this.editor = editor
    this.node = node
    this.getPos = getPos
    this.dom = document.createElement('tr')
    this.contentDOM = this.dom
    this.updateDomClass()
  }

  update(
    node: Node,
    decorations: readonly Decoration[],
    innerDecorations: DecorationSource
  ): boolean {
    if (node.type !== this.node.type) return false
    this.node = node
    this.updateDomClass()
    return true
  }

  private updateDomClass() {
    if (this.node.attrs.className) {
      this.dom.classList.add(this.node.attrs.className)
    } else {
      this.dom.className = ''
    }
  }
}
