import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { Node } from '@tiptap/pm/model'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const HexColorHighlighter = Extension.create({
  name: 'hex-color-highlighter',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        state: {
          init(_, { doc }) {
            return findHexColors(doc)
          },
          apply(transaction, oldState) {
            return transaction.docChanged ? findHexColors(transaction.doc) : oldState
          }
        },
        props: {
          decorations(state) {
            return this.getState(state)
          }
        }
      })
    ]
  }
})

function findHexColors(doc: Node): DecorationSet {
  const hexColor = /(#[0-9a-f]{3,6})\b/gi
  const decorations: Decoration[] = []

  let codeBlock: Node | null = null
  let codeBlockChilds: Node[] = []
  doc.descendants((node, position) => {
    if (node.type.name === 'codeBlock') {
      codeBlock = node
      codeBlockChilds = []
      codeBlock.descendants((node, position) => {
        codeBlockChilds.push(node)
      })
    }
    if (!node.text) {
      return
    }
    if (codeBlock && codeBlockChilds.includes(node)) {
      return
    }
    Array.from(node.text.matchAll(hexColor)).forEach((match) => {
      const color = match[0]
      const index = match.index || 0
      const from = position + index
      const to = from + color.length
      const decoration = Decoration.inline(from, to, {
        class: 'color',
        style: `--color: ${color}`
      })

      decorations.push(decoration)
    })
  })
  return DecorationSet.create(doc, decorations)
}
