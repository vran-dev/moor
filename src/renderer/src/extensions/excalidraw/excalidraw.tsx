import { Node, nodeInputRule, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react'
import ExcalidrawWrapper from './excalidrawWrapper'
import { NodeSelection } from 'prosemirror-state'
import { createParagraphNear } from 'prosemirror-commands'

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
    const editor = this.editor
    return ReactNodeViewRenderer(ExcalidrawWrapper, {
      stopEvent({ event }) {
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
            const view = editor.view
            if (!createParagraphNear(view.state, view.dispatch)) {
              return false
            }
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
        if (event.type === 'mousedown') {
          const mouseEvent = event as MouseEvent
          const view = editor.view
          const pos = view.posAtCoords({ left: mouseEvent.clientX, top: mouseEvent.clientY })
          if (pos) {
            const selection = NodeSelection.create(view.state.doc, pos.pos)
            const transaction = view.state.tr.setSelection(selection)
            view.dispatch(transaction)
          }
        }
        return true
      },
      attrs: {
        style: 'width:  800px; height: 600px;'
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
