import { $isListItemNode, MoorListItemNode } from '@renderer/editor/node/MoorList/ListItem'
import { $getNodeByKey, $getSelection, $isRangeSelection, LexicalNode } from 'lexical'

export function handleListItemBackspace(event: KeyboardEvent): boolean {
  const selection = $getSelection()
  if ($isRangeSelection(selection)) {
    const focusKey = selection.focus.key
    const focusNode = $getNodeByKey(focusKey)
    const listItemNode = findClosestListItemNode(focusNode)
    if ($isListItemNode(listItemNode)) {
      event.preventDefault()
      if (listItemNode.isEmpty()) {
        
        return true
      }
      return false
    }
  }
  return false
}

export function handleListItemTab(event: KeyboardEvent): boolean {
  const selection = $getSelection()
  if ($isRangeSelection(selection)) {
    const focusKey = selection.focus.key
    const focusNode = $getNodeByKey(focusKey)
    const listItemNode = findClosestListItemNode(focusNode)
    if ($isListItemNode(listItemNode)) {
      event.preventDefault()
      const brotherNode = listItemNode.getPreviousSibling()
      if (brotherNode == null || !$isListItemNode(brotherNode)) {
        return true
      }
      const brotherIndent = brotherNode.getIndent()
      if (listItemNode.getIndent() > brotherIndent) {
        return true
      }
      listItemNode.setIndent(listItemNode.getIndent() + 1)
      return true
    }
  }
  return false
}

export function handleListItemShiftTab(event: KeyboardEvent): boolean {
  const selection = $getSelection()
  if ($isRangeSelection(selection)) {
    const focusKey = selection.focus.key
    const focusNode = $getNodeByKey(focusKey)
    const listItemNode = findClosestListItemNode(focusNode)
    if ($isListItemNode(listItemNode)) {
      event.preventDefault()
      if (listItemNode.getIndent() === 0) {
        return true
      }
      listItemNode.setIndent(listItemNode.getIndent() - 1)
      return true
    }
  }
  return false
}

export function findClosestListItemNode(node: LexicalNode | null): MoorListItemNode | null {
  if (node == null) {
    return null
  }
  if ($isListItemNode(node)) {
    return node
  }

  const parent = node.getParent()
  if (parent) {
    return findClosestListItemNode(parent)
  }
  return null
}
