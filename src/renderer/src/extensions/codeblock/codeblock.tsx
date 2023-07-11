import { CodeBlock } from '@tiptap/extension-code-block'
import { InputRule, callOrReturn, NodeViewRenderer } from '@tiptap/react'
import { CodeblockView } from './codeblockView'

export const CustomCodeBlock = CodeBlock.extend({
  inline: false,
  HTMLAttributes: {
    class: 'hover:outline hover:outline-blue-300'
  },

  addNodeView() {
    return (props) => {
      return new CodeblockView(props.node, props.editor.view, props.getPos)
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: /^```([a-z]+)?[\s\n]$/,
        handler: ({ state, range, match }): void => {
          const nodeType = this.type
          const $start = state.doc.resolve(range.from)
          const attributes = callOrReturn({}, undefined, match) || {}

          if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) {
            return
          }

          state.tr
            .delete(range.from, range.to)
            .replaceRangeWith(range.from, range.from + 1, nodeType.create(attributes))
          // .setBlockType(range.from, range.from, nodeType, attributes)
        }
      })
    ]
  }
})

export default CustomCodeBlock
