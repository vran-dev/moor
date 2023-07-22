import { Node, nodeInputRule, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react'
import ExcalidrawWrapper from './excalidrawWrapper'

const inputRegex = /^```excalidraw\n/

export const DEFAULT_EXCALIDRAW_DATA = ''

export interface ExcalidrawOptions {
  HTMLAttributes: Record<string, any>
}

export interface IExcalidrawAttrs {
  width?: string
  height?: string
  data?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    excalidraw: {
      insertExcalidraw: (attrs?: IExcalidrawAttrs) => ReturnType
    }
  }
}

const ExcalidrawNode = Node.create<ExcalidrawOptions>({
  name: 'excalidraw',
  group: 'block',
  selectable: true,
  isolating: true,
  atom: true,
  draggable: true,
  inline: false,

  addAttributes() {
    return {
      id: {
        default: null
      },
      data: {
        default: DEFAULT_EXCALIDRAW_DATA,
        parseHTML: (element): string | null => {
          const nodeData = element.attributes.getNamedItem('data')
          if (!nodeData) {
            return null
          }
          return nodeData.value
        },
        rendered: false
      }
    }
  },

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'excalidraw'
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[class=excalidraw]'
      }
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ExcalidrawWrapper)
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type
      })
    ]
  },

  addCommands() {
    return {
      insertExcalidraw:
        (options) =>
        ({ commands }): boolean => {
          return commands.insertContent({
            type: this.name,
            attrs: options
          })
        }
    }
  }
})

export default ExcalidrawNode
