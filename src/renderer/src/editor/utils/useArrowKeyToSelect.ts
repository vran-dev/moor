import { useCallback, useEffect } from 'react'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  LexicalEditor,
  LexicalNode,
  NodeKey
} from 'lexical'
import { findClosestNextSibling, findClosestPrevSibling } from './EditorHelper'

export function useArrowKeyToSelect(
  props: {
    nodeKey: NodeKey
    editor: LexicalEditor
    onSelect: (event: KeyboardEvent) => boolean
    primaryHandler?: (keyAction: KeyboardEvent) => boolean
  },
  observed?: any[]
): void {
  const { editor, nodeKey, primaryHandler } = props
  const nodePredicate = useCallback(
    (node: LexicalNode | null) => {
      return node?.getKey() === nodeKey
    },
    [nodeKey]
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_DOWN_COMMAND,
        (event, targetEditor) => {
          if (primaryHandler && primaryHandler(event)) {
            return true
          }
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const nextSibling = findClosestNextSibling(selection.anchor.getNode())
            if (nextSibling && nodePredicate(nextSibling)) {
              event.preventDefault()
              event.stopImmediatePropagation()
              return props.onSelect(event)
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_UP_COMMAND,
        (event, targetEditor) => {
          if (primaryHandler && primaryHandler(event)) {
            return true
          }
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const prevSibling = findClosestPrevSibling(selection.anchor.getNode())
            if (prevSibling && nodePredicate(prevSibling)) {
              event.preventDefault()
              event.stopImmediatePropagation()
              return props.onSelect(event)
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [nodeKey, editor, ...(observed ?? [])])
}
