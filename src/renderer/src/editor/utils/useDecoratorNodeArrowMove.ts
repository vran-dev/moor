import { useEffect } from 'react'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  LexicalEditor
} from 'lexical'

export function useDecoratorNodeArrowMove(props: {
  editor: LexicalEditor
  predicate: (node) => boolean
  focus: () => boolean
}): void {
  const { editor, predicate } = props
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_DOWN_COMMAND,
        (event, targetEditor) => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const topEle = selection.anchor.getNode().getTopLevelElement()
            if (topEle && topEle.getNextSibling() && predicate(topEle.getNextSibling())) {
              return props.focus()
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_UP_COMMAND,
        (event, targetEditor) => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const topEle = selection.anchor.getNode().getTopLevelElement()
            if (topEle && topEle.getPreviousSibling() && predicate(topEle.getPreviousSibling())) {
              return props.focus()
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [])
}
