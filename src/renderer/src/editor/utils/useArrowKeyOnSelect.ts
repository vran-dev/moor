import { useCallback, useEffect } from 'react'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isNodeSelection,
  COMMAND_PRIORITY_LOW,
  ElementNode,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  NodeSelection
} from 'lexical'
import { selectByNodeType } from './EditorHelper'

export function useArrowKeyOnSelect(
  props: {
    nodeKey: NodeKey
    editor: LexicalEditor
    primaryHandler?: (
      keyAction: KeyboardEvent,
      prepareToSelect: LexicalNode | ElementNode | null | undefined
    ) => boolean
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

  const handleArrowKeyWhenNodeSelected = useCallback(
    (event: KeyboardEvent, selection: NodeSelection) => {
      const nodes = selection.getNodes()
      if (nodes.length === 1 && nodePredicate(nodes[0])) {
        let prepareToSelect: LexicalNode | ElementNode | null | undefined = null
        if (event.key === 'ArrowUp') {
          prepareToSelect = nodes[0].getPreviousSibling()?.getTopLevelElement()
        } else {
          prepareToSelect = nodes[0].getNextSibling()?.getTopLevelElement()
        }
        if (primaryHandler && primaryHandler(event, prepareToSelect)) {
          return true
        }
        if (selectByNodeType(prepareToSelect)) {
          event.preventDefault()
          event.stopImmediatePropagation()
          return true
        }
      }
      return false
    },
    [nodeKey, editor, ...(observed ?? [])]
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_DOWN_COMMAND,
        (event, targetEditor) => {
          if (isNodeSelected(nodeKey)) {
            const selection = $getSelection()
            return handleArrowKeyWhenNodeSelected(event, selection as NodeSelection)
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_UP_COMMAND,
        (event, targetEditor) => {
          if (isNodeSelected(nodeKey)) {
            const selection = $getSelection()
            return handleArrowKeyWhenNodeSelected(event, selection as NodeSelection)
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [nodeKey, editor, ...(observed ?? [])])
}

export function isNodeSelected(nodeKey: NodeKey): boolean {
  const selection = $getSelection()
  if ($isNodeSelection(selection)) {
    const nodes = selection.getNodes()
    if (nodes.length === 1) {
      return nodes[0].getKey() === nodeKey
    }
  }
  return false
}
