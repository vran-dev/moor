import {
  $createMarkNode,
  $isMarkNode,
  $unwrapMarkNode,
  $wrapSelectionInMarkNode,
  MarkNode
} from '@lexical/mark'
import {
  $addUpdateTag,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
  LexicalNode,
  NodeKey
} from 'lexical'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'

export function usePreudoSelection(
  editor: LexicalEditor
): [(className?: string) => void, () => void] {
  const markNodeMap = useMemo<Map<string, Set<NodeKey>>>(() => {
    return new Map()
  }, [])

  const updateSelectionState = useCallback((className?: string) => {
    if (!editor) {
      return
    }
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        editor.update(() => {
          if ($isRangeSelection(selection)) {
            const isBackward = selection.isBackward()
            const id = uuid()
            const set = new Set<NodeKey>()
            markNodeMap.set(id, set)
            $addUpdateTag('historic')
            $wrapSelectionInMarkNode(selection, isBackward, id, (ids) => {
              const markNode = $createMarkNode(ids)
              set.add(markNode.getKey())
              return markNode
            })
          }
        })
      }
    })
  }, [])

  const resetSelectionState = useCallback(() => {
    if (!editor) {
      return
    }
    editor.update(() => {
      for (const [id, keys] of markNodeMap) {
        for (const key of keys) {
          $addUpdateTag('historic')
          const node: null | MarkNode = $getNodeByKey(key)
          if ($isMarkNode(node)) {
            node.deleteID(id)
            if (node.getIDs().length === 0) {
              $unwrapMarkNode(node)
            }
          }
        }
        markNodeMap.delete(id)
      }
    })
  }, [])

  useEffect(() => {
    return () => {
      resetSelectionState()
    }
  }, [])

  return [updateSelectionState, resetSelectionState]
}
