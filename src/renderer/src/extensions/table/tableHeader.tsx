/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Editor } from '@tiptap/react'
import { Node } from 'prosemirror-model'
import { Decoration, DecorationSource, NodeView } from 'prosemirror-view'
import TableHeader from '@tiptap/extension-table-header'

export const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      colspan: {
        default: 1
      },
      rowspan: {
        default: 1
      },
      align: {
        default: 'left',
        parseHTML: (element) => {
          const align = element.getAttribute('align')
          return align
        },
        renderHTML: attributes => {
          return {
            align: attributes.align
          }
        }
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
      return new TableHeaderNodeView(this.editor, props.node, props.getPos)
    }
  }
})

class TableHeaderNodeView implements NodeView {
  editor: Editor
  dom: HTMLElement
  contentDOM?: HTMLElement | null | undefined
  node: Node
  getPos: () => number

  constructor(editor: Editor, node: Node, getPos: () => number) {
    this.editor = editor
    this.node = node
    this.getPos = getPos
    this.dom = document.createElement('th')
    this.contentDOM = this.dom
    this.dom.align = node.attrs.align
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
