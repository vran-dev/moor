import { EditorSelection } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { selectAll as cmSelectAll } from '@codemirror/commands'
import {
  $createNodeSelection,
  $getNodeByKey,
  $getSelection,
  $isDecoratorNode,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_DOWN_COMMAND,
  LexicalEditor,
  LexicalNode,
  NodeKey
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import { useEffect } from 'react'

export function useCodeMirrorSelectAll(
  editor: LexicalEditor,
  codeMirror: EditorView | null | undefined
): void {
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<KeyboardEvent>(
        KEY_DOWN_COMMAND,
        (event, targetEditor): boolean => {
          // delegate select_all to codemirror
          if (event.ctrlKey || event.metaKey) {
            if (event.key === 'a') {
              if (codeMirror && codeMirror.hasFocus) {
                event.preventDefault()
                event.stopImmediatePropagation()
                cmSelectAll(codeMirror)
                return true
              }
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, codeMirror])
}
