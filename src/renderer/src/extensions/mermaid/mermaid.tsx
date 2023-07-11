import { Node, mergeAttributes, ReactNodeViewRenderer, nodeInputRule } from '@tiptap/react'
import MermaidWrapper from './mermaidView'
export interface MermadNodeOptions {
  HTMLAttributes: Record<string, any>
}

const inputRegex = /^```mermaid\n/

export const MermaidNode = Node.create<MermadNodeOptions>({
  name: 'mermaid',
  group: 'block',
  content: 'text*',
  marks: '',
  selectable: false,
  draggable: true,
  inline: false,

  addAttributes() {
    return {
      id: {
        default: null
      }
    }
  },

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'mermaid not-prose'
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[class=mermaid]'
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidWrapper)
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type
      })
    ]
  }
})
