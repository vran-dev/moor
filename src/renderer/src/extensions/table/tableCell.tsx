import TableCell from '@tiptap/extension-table-cell'
import { Editor } from '@tiptap/react'
import { Node } from 'prosemirror-model'
import { Decoration, DecorationSource, NodeView } from 'prosemirror-view'

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      colspan: {
        default: 1
      },
      rowspan: {
        default: 1
      },
      colwidth: {
        default: null,
        parseHTML: (element) => {
          const colwidth = element.getAttribute('colwidth')
          const value = colwidth ? [parseInt(colwidth, 10)] : null

          return value
        }
      },
      className: {
        default: null,
        parseHTML: element => {
          return element.getAttribute('class')
        },
        renderHTML: attributes => {
          return {
            class: attributes.className ? attributes.className : null
          }
        }
      }
    }
  },

  addNodeView() {
    return (props): NodeView => {
      const editor = this.editor
      return new TableCellNodeView(editor, props.node, props.getPos)
    }
  }
})

class TableCellNodeView implements NodeView {
  editor: Editor
  dom: HTMLElement
  contentDOM?: HTMLElement | null | undefined
  node: Node
  getPos: (() => number) | boolean

  constructor(editor: Editor, node: Node, getPos: (() => number) | boolean) {
    this.editor = editor
    this.node = node
    this.getPos = getPos
    this.dom = document.createElement('td')
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

  private updateDomClass(): void {
    if (this.node.attrs.className) {
      this.dom.classList.add(this.node.attrs.className)
    } else {
      this.dom.className = ''
    }
  }
}
