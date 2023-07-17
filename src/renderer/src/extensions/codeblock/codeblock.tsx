import { CodeBlock, backtickInputRegex, tildeInputRegex } from '@tiptap/extension-code-block'
import { CodeblockView } from './codeblockView'
import { InputRule, InputRuleFinder, callOrReturn } from '@tiptap/react'
import { NodeType } from 'prosemirror-model'
import { ExtendedRegExpMatchArray } from '@tiptap/react'
import { suggestLanguages } from './suggestLanguages'

export function textblockTypeInputRule(config: {
  find: InputRuleFinder
  type: NodeType
  getAttributes?:
    | Record<string, any>
    | ((match: ExtendedRegExpMatchArray) => Record<string, any>)
    | false
    | null
}): InputRule {
  return new InputRule({
    find: config.find,
    handler: ({ state, range, match }) => {
      const $start = state.doc.resolve(range.from)
      const attributes = callOrReturn(config.getAttributes, undefined, match) || {}

      if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), config.type)) {
        return null
      }
      if (!attributes.language) {
        return null
      }
      if (suggestLanguages({ query: attributes.language }).length > 0) {
        return null
      }
      state.tr
        .delete(range.from, range.to)
        .setBlockType(range.from, range.from, config.type, attributes)
    }
  })
}

export const CustomCodeBlock = CodeBlock.extend({
  inline: false,

  addNodeView() {
    return (props) => {
      return new CodeblockView(props.node, props.editor.view, props.getPos)
    }
  },
  addInputRules() {
    return [
      textblockTypeInputRule({
        find: backtickInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1]
        })
      }),
      textblockTypeInputRule({
        find: tildeInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1]
        })
      })
    ]
  }
})

export default CustomCodeBlock
