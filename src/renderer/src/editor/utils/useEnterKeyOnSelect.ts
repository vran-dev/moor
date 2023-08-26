import { useCallback, useEffect } from 'react'
import { mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_ENTER_COMMAND,
  LexicalEditor,
  LexicalNode,
  NodeKey
} from 'lexical'
import { findClosestPrevSibling, selectByNodeType } from './EditorHelper'

export function useEnterKeyOnSelect(
  props: {
    nodeKey: NodeKey
    editor: LexicalEditor
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
        KEY_ENTER_COMMAND,
        (event, targetEditor) => {
          const selection = $getSelection()
          if ($isNodeSelection(selection)) {
            const nodes = selection.getNodes()
            if (nodes.length === 1 && nodePredicate(nodes[0])) {
              if (primaryHandler && primaryHandler(event)) {
                return true
              } else {
                // fallback to default handler
                event.preventDefault()
                event.stopImmediatePropagation()
                const curr = nodes[0]
                const paragraph = $createParagraphNode()
                curr.insertAfter(paragraph)
                paragraph.select()
                return true
              }
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),

      editor.registerCommand<KeyboardEvent>(
        KEY_BACKSPACE_COMMAND,
        (event, targetEditor) => {
          const selection = $getSelection()
          if ($isNodeSelection(selection)) {
            const nodes = selection.getNodes()
            if (nodes.length === 1 && nodePredicate(nodes[0])) {
              if (primaryHandler && primaryHandler(event)) {
                return true
              } else {
                // fallback to default handler
                event.preventDefault()
                event.stopImmediatePropagation()
                $setSelection(null)
                const sibling = findClosestPrevSibling(nodes[0])
                selectByNodeType(sibling)
                nodes[0].remove()
                return true
              }
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [nodeKey, editor, ...(observed ?? [])])
}
