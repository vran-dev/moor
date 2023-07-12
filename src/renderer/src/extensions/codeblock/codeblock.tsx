import { CodeBlock } from '@tiptap/extension-code-block'
import { CodeblockView } from './codeBlockView'

export const CustomCodeBlock = CodeBlock.extend({
  inline: false,
  HTMLAttributes: {
    class: 'hover:outline hover:outline-blue-300'
  },

  addNodeView() {
    return (props) => {
      return new CodeblockView(props.node, props.editor.view, props.getPos)
    }
  }
})

export default CustomCodeBlock
