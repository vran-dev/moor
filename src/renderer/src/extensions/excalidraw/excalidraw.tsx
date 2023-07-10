import { Node, nodeInputRule, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react'
import ExcalidrawWrapper from './excalidrawWrapper'

const inputRegex = /^```excalidraw\n/

export interface ExcalidrawOptions {
  HTMLAttributes: Record<string, any>
}

const ExcalidrawNode = Node.create<ExcalidrawOptions>({
  name: 'excalidraw',

  group: 'block',

  content: 'text*',

  draggable: true,

  atom: true,

  selectable: false,

  addAttributes() {
    return {
      id: {
        default: null
      }
    }
  },

  addOptions() {
    return {
      HTMLAttributes: {}
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['excalidraw-node-view', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  parseHTML() {
    return [
      {
        tag: 'excalidraw-node-view'
      }
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExcalidrawWrapper, {
      update(props) {
      }
    })
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

export default ExcalidrawNode
