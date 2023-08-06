import Placeholder from '@tiptap/extension-placeholder'
import { Node } from 'prosemirror-model'

export const customPlaceholderExtension = Placeholder.configure({
  placeholder: ({ editor, node, pos }) => {
    if (node.type.name === 'heading') {
      return `Heading ${node.attrs.level}`
    }
    if (node.type.name === 'codeBlock') {
      return `Writing code...`
    }
    if (pos == 0 && node.type.name !== 'codeBlock') {
      return "Writing or Press '/' for commands"
    }
    const doc = editor.view.state.doc

    let p = doc
    doc.descendants((curr: Node, currPos: number, parent: Node): boolean | void => {
      if (curr === node) {
        p = parent
        return false
      }
      if (currPos > pos) {
        return false
      }
    })
    if (p != null) {
      if (p.type.name === 'tableCell') {
        return ''
      }
      if (p.type.name === 'tableHeader') {
        return ''
      }
      if (p.type.name === 'codeBlock') {
        return ''
      }
    }
    return "Writing or Press '/' for commands"
  },
  includeChildren: true
})
