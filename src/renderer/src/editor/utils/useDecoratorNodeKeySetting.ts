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

export function useDecoratorNodeKeySetting(
  props: {
    nodeKey: NodeKey
    editor: LexicalEditor
    focus: () => boolean
  },
  observed?: any[]
): void {
  const { editor, nodeKey } = props
  const nodePredicate = useCallback(
    (node: LexicalNode | null) => {
      return node?.getKey() === nodeKey
    },
    [nodeKey, ...(observed ?? [])]
  )

  const handleUpOrDownWhenNodeSelected = useCallback(
    (event: KeyboardEvent, selection: NodeSelection, isUp: boolean) => {
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
        console.log('prepareToSelect', prepareToSelect)
        if (prepareToSelect) {
          if ($isElementNode(prepareToSelect)) {
            prepareToSelect.select()
            return true
          }
          if ($isDecoratorNode(prepareToSelect)) {
            const ns = $createNodeSelection()
            ns.add(prepareToSelect.getKey())
            $setSelection(ns)
            return true
          }
        }
        return false
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
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const topEle = selection.anchor.getNode().getTopLevelElement()
            if (topEle && nodePredicate(topEle.getNextSibling())) {
              return props.focus()
            }
          }
          if ($isNodeSelection(selection)) {
            return handleUpOrDownWhenNodeSelected(event, selection as NodeSelection, false)
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
            if (topEle && nodePredicate(topEle.getPreviousSibling())) {
              return props.focus()
            }
          }
          if ($isNodeSelection(selection)) {
            return handleUpOrDownWhenNodeSelected(event, selection as NodeSelection, true)
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ENTER_COMMAND,
        (event, targetEditor) => {
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
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [nodeKey, ...(observed ?? [])])
}
