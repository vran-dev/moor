import { CodeBlock, backtickInputRegex, tildeInputRegex } from '@tiptap/extension-code-block'
import { InputRule, InputRuleFinder, ReactNodeViewRenderer, callOrReturn } from '@tiptap/react'
import { NodeType } from 'prosemirror-model'
import { ExtendedRegExpMatchArray } from '@tiptap/react'
import { suggestLanguages } from './suggestLanguages'
import { Plugin, PluginKey, Selection, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { CodeblockView } from './codeblockView'
import { CodeBlockNodeView } from './codeblockNodeView'
import { CustomReactNodeViewRenderer } from '@renderer/editor/tiptap/CustomReactNodeViewRenderer'

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
      // don’t create a new code block within code blocks
      if (suggestLanguages({ query: attributes.language }).length > 0) {
        return null
      }
      state.tr
        .delete(range.from, range.to)
        .setBlockType(range.from, range.from, config.type, attributes)
    }
  })
}

export const markdownCodeBlockContentRegex = /^```(\w*)\n([\s\S]*?)\n```$/

export const CustomCodeBlock = CodeBlock.extend({
  inline: false,
  draggable: true,
  selectable: true,
  atom: true,

  addNodeView() {
    const editor = this.editor
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    // return (props) => {
    //   return new CodeblockView(props.node, props.editor.view, props.getPos, editor)
    // }
    return CustomReactNodeViewRenderer(CodeBlockNodeView, {
      stopEvent(e): boolean {
        if (e instanceof DragEvent) {
          return false
        }
        return true
      }
    })
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
  },

  addKeyboardShortcuts() {
    const editor = this.editor
    const arrowHandler = (dir) => {
      return (): boolean => {
        const state = editor.state
        const view = editor.view
        const dispatch = view.dispatch
        if (state.selection.empty && view.endOfTextblock(dir)) {
          const side = dir == 'left' || dir == 'up' ? -1 : 1
          const $head = state.selection.$head
          const nextPos = Selection.near(
            state.doc.resolve(side > 0 ? $head.after() : $head.before()),
            side
          )
          if (nextPos.$head && nextPos.$head.parent.type.name == 'codeBlock') {
            dispatch(state.tr.setSelection(nextPos))
            console.log('match codeblock')
            return true
          }
        }
        return false
      }
    }
    return {
      ArrowLeft: arrowHandler('left'),
      ArrowRight: arrowHandler('right'),
      ArrowUp: arrowHandler('up'),
      ArrowDown: arrowHandler('down')
    }
  },
  addProseMirrorPlugins() {
    return [
      // this plugin creates a code block for pasted content from VS Code
      // we can also detect the copied code language
      new Plugin({
        key: new PluginKey('codeBlockVSCodeHandler'),
        props: {
          handlePaste: (view: EditorView, event: ClipboardEvent): boolean | void => {
            if (!event.clipboardData) {
              return false
            }

            // don’t create a new code block within code blocks
            if (this.editor.isActive(this.type.name)) {
              return false
            }

            let text = event.clipboardData.getData('text/plain')
            if (!text) {
              return false
            }

            const vscode = event.clipboardData.getData('vscode-editor-data')
            let language = vscode ? JSON.parse(vscode).mode : undefined
            if (vscode && !language) {
              return false
            }

            // match markdown code block paste
            const codeBlockMatch = markdownCodeBlockContentRegex.exec(text)
            if (codeBlockMatch) {
              language = codeBlockMatch[1]
              text = codeBlockMatch[2]
            } else {
              return false
            }

            const { tr } = view.state

            // create an empty code block
            tr.replaceSelectionWith(this.type.create({ language }))
            // put cursor inside the newly created code block
            tr.setSelection(TextSelection.near(tr.doc.resolve(Math.max(0, tr.selection.from - 2))))

            // add text to code block
            // strip carriage return chars from text pasted as code
            // see: https://github.com/ProseMirror/prosemirror-view/commit/a50a6bcceb4ce52ac8fcc6162488d8875613aacd
            tr.insertText(text.replace(/\r\n?/g, '\n'))

            // store meta information
            // this is useful for other plugins that depends on the paste event
            // like the paste rule plugin
            tr.setMeta('paste', true)

            view.dispatch(tr)

            return true
          }
        }
      })
    ]
  }
})

export default CustomCodeBlock
