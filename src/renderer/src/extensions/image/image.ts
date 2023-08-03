import Image from '@tiptap/extension-image'
import { InputRule } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { ImageView } from './imageView'
import { v4 as uuidv4 } from 'uuid'

export const CustomImage = Image.extend({
  name: 'image',

  addNodeView() {
    return (props) => {
      return new ImageView(props.node, props.editor, props.getPos)
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        renderHTML: (attributes) => {
          return {
            id: attributes.id
          }
        }
      },
      src: {
        default: null,
        renderHTML: (attributes) => {
          return {
            src: attributes.src
          }
        }
      },
      alt: {
        default: null,
        renderHTML: (attributes) => {
          return {
            alt: attributes.alt
          }
        }
      },
      title: {
        default: null
      },
      width: {
        default: null
      },
      height: {
        default: null
      }
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: /!\[(.+?)\]\((\S+?)\)$/,
        handler: (props) => {
          const { match, range } = props
          const alt = match[1]
          const src = match[2]
          const { tr } = props.state
          if (alt && src) {
            tr.replaceWith(
              range.from,
              range.to,
              this.editor.schema.nodes.image.create({ src, alt })
            )
          }
        }
      })
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste(view, event, slice) {
            const items = (event.clipboardData || event.originalEvent.clipboardData).items
            for (let i = 0; i < items.length; i++) {
              const item = items[i]
              if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile()
                const reader = new FileReader()
                // TODO save image to specific local directory
                reader.onload = (event) => {
                  const base64 = event.target.result
                  const { tr } = view.state
                  const node = view.state.schema.nodes.image.create({
                    src: base64,
                    alt: 'image',
                    id: uuidv4()
                  })
                  const transaction = tr.replaceSelectionWith(node)
                  view.dispatch(transaction)
                }
                reader.readAsDataURL(file)
                break
              }
            }
          }
        }
      })
    ]
  }
})

export default CustomImage
