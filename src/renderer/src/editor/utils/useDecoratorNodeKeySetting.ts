import { useCallback, useEffect } from 'react'
import { mergeRegister } from '@lexical/utils'
import {
  $createNodeSelection,
  $createParagraphNode,
  $getSelection,
  $isDecoratorNode,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  ElementNode,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  NodeSelection
} from 'lexical'

export type KeyAction = 'ArrowUp' | 'ArrowDown'

export function useDecoratorNodeKeySetting(
  props: {
    nodeKey: NodeKey
    editor: LexicalEditor
    onSelect: (keyAction: KeyAction) => boolean
    primaryHandler?: (keyAction: KeyboardEvent) => boolean
    fallbackHandler?: (keyAction: KeyboardEvent) => boolean
  },
  observed?: any[]
): void {
  const { editor, nodeKey, primaryHandler, fallbackHandler } = props
  const nodePredicate = useCallback(
    (node: LexicalNode | null) => {
      return node?.getKey() === nodeKey
    },
    [nodeKey, ...(observed ?? [])]
  )

  const handleUpOrDownWhenNodeSelected = useCallback(
    (
      event: KeyboardEvent,
      selection: NodeSelection,
      isUp: boolean,
      onSelect?: (keyAction: KeyAction) => boolean
    ) => {
      const nodes = selection.getNodes()
      if (nodes.length === 1 && nodePredicate(nodes[0])) {
        event.preventDefault()
        event.stopImmediatePropagation()
        let prepareToSelect: LexicalNode | ElementNode | null | undefined = null
        if (isUp) {
          prepareToSelect = nodes[0].getPreviousSibling()?.getTopLevelElement()
        } else {
          prepareToSelect = nodes[0].getNextSibling()?.getTopLevelElement()
        }
        if (prepareToSelect) {
          if ($isElementNode(prepareToSelect)) {
            prepareToSelect.select()
            return true
          }
          if ($isDecoratorNode(prepareToSelect)) {
            if (prepareToSelect.getKey() === nodeKey && onSelect) {
              return onSelect(isUp ? 'ArrowUp' : 'ArrowDown')
            }
            // fallback to select the node
            const ns = $createNodeSelection()
            ns.add(prepareToSelect.getKey())
            $setSelection(ns)
            return true
          }
        }
      }
      return false
    },
    [nodeKey, ...(observed ?? [])]
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
            const topEle = selection.anchor.getNode().getTopLevelElement()
            if (topEle && nodePredicate(topEle.getNextSibling())) {
              event.preventDefault()
              event.stopImmediatePropagation()
              return props.onSelect('ArrowDown')
            }
          }
          if ($isNodeSelection(selection)) {
            return handleUpOrDownWhenNodeSelected(
              event,
              selection as NodeSelection,
              false,
              props.onSelect
            )
          }
          if (props.fallbackHandler) {
            return props.fallbackHandler(event)
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
            const topEle = selection.anchor.getNode().getTopLevelElement()
            if (topEle && nodePredicate(topEle.getPreviousSibling())) {
              event.preventDefault()
              event.stopImmediatePropagation()
              return props.onSelect('ArrowUp')
            }
          }
          if ($isNodeSelection(selection)) {
            return handleUpOrDownWhenNodeSelected(
              event,
              selection as NodeSelection,
              true,
              props.onSelect
            )
          }
          if (props.fallbackHandler) {
            return props.fallbackHandler(event)
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ENTER_COMMAND,
        (event, targetEditor) => {
          if (primaryHandler && primaryHandler(event)) {
            return true
          }
          const selection = $getSelection()
          if ($isNodeSelection(selection)) {
            const nodes = selection.getNodes()
            if (nodes.length === 1 && nodePredicate(nodes[0])) {
              event.preventDefault()
              event.stopImmediatePropagation()
              const curr = nodes[0]
              const paragraph = $createParagraphNode()
              curr.insertAfter(paragraph)
              paragraph.select()
              return true
            }
          }
          if (props.fallbackHandler) {
            return props.fallbackHandler(event)
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [nodeKey, ...(observed ?? [])])
}
