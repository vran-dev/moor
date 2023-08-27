import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isLeafNode,
  $isParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  DEPRECATED_$isGridSelection,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  ParagraphNode
} from 'lexical'
import { $getNearestNodeOfType } from '@lexical/utils'
import { $createListItemNode, $isListItemNode, MoorListItemNode } from './ListItem'
import { $createListNode, $isListNode, ListType, MoorListNode } from './List'

export function insertList(editor: LexicalEditor, listType: ListType): void {
  editor.update(() => {
    const selection = $getSelection()

    if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
      const nodes = selection.getNodes()
      const anchor = selection.anchor
      const anchorNode = anchor.getNode()
      const anchorNodeParent = anchorNode.getParent()

      if ($isSelectingEmptyListItem(anchorNode, nodes)) {
        const list = $createListNode(listType)
        if ($isRootOrShadowRoot(anchorNodeParent)) {
          anchorNode.replace(list)
          const listItem = $createListItemNode()
          if ($isElementNode(anchorNode)) {
            listItem.setFormat(anchorNode.getFormatType())
            listItem.setIndent(anchorNode.getIndent())
          }
          list.append(listItem)
        } else if ($isListItemNode(anchorNode)) {
          const parent = anchorNode.getParentOrThrow()
          append(list, parent.getChildren())
          parent.replace(list)
        }

        return
      } else {
        const handled = new Set()
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]

          if ($isElementNode(node) && node.isEmpty() && !handled.has(node.getKey())) {
            createListOrMerge(node, listType)
            continue
          }

          if ($isLeafNode(node)) {
            let parent = node.getParent()
            while (parent != null) {
              const parentKey = parent.getKey()

              if ($isListNode(parent)) {
                if (!handled.has(parentKey)) {
                  const newListNode = $createListNode(listType)
                  append(newListNode, parent.getChildren())
                  parent.replace(newListNode)
                  handled.add(parentKey)
                }

                break
              } else {
                const nextParent = parent.getParent()
                if ($isRootOrShadowRoot(nextParent) && !handled.has(parentKey)) {
                  handled.add(parentKey)
                  createListOrMerge(parent, listType)
                  break
                }
                parent = nextParent
              }
            }
          }
        }
      }
    }
  })
}

/**
 * Searches for the nearest ancestral ListNode and removes it. If selection is an empty ListItemNode
 * it will remove the whole list, including the ListItemNode. For each ListItemNode in the ListNode,
 * removeList will also generate new ParagraphNodes in the removed ListNode's place. Any child node
 * inside a ListItemNode will be appended to the new ParagraphNodes.
 * @param editor - The lexical editor.
 */
export function removeList(editor: LexicalEditor): void {
  editor.update(() => {
    const selection = $getSelection()

    if ($isRangeSelection(selection)) {
      const listNodes = new Set<MoorListNode>()
      const nodes = selection.getNodes()
      const anchorNode = selection.anchor.getNode()

      if ($isSelectingEmptyListItem(anchorNode, nodes)) {
        listNodes.add($getTopListNode(anchorNode))
      } else {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]

          if ($isLeafNode(node)) {
            const listItemNode = $getNearestNodeOfType(node, MoorListItemNode)

            if (listItemNode != null) {
              listNodes.add($getTopListNode(listItemNode))
            }
          }
        }
      }

      for (const listNode of listNodes) {
        let insertionPoint: MoorListNode | ParagraphNode = listNode

        const listItems = $getAllListItems(listNode)

        for (const listItemNode of listItems) {
          const paragraph = $createParagraphNode()

          append(paragraph, listItemNode.getChildren())

          insertionPoint.insertAfter(paragraph)
          insertionPoint = paragraph

          // When the anchor and focus fall on the textNode
          // we don't have to change the selection because the textNode will be appended to
          // the newly generated paragraph.
          // When selection is in empty nested list item, selection is actually on the listItemNode.
          // When the corresponding listItemNode is deleted and replaced by the newly generated paragraph
          // we should manually set the selection's focus and anchor to the newly generated paragraph.
          if (listItemNode.__key === selection.anchor.key) {
            selection.anchor.set(paragraph.getKey(), 0, 'element')
          }
          if (listItemNode.__key === selection.focus.key) {
            selection.focus.set(paragraph.getKey(), 0, 'element')
          }

          listItemNode.remove()
        }
        listNode.remove()
      }
    }
  })
}

function $isSelectingEmptyListItem(
  anchorNode: MoorListItemNode | LexicalNode,
  nodes: Array<LexicalNode>
): boolean {
  return (
    $isListItemNode(anchorNode) &&
    (nodes.length === 0 ||
      (nodes.length === 1 && anchorNode.is(nodes[0]) && anchorNode.getChildrenSize() === 0))
  )
}

function append(node: ElementNode, nodesToAppend: Array<LexicalNode>) {
  node.splice(node.getChildrenSize(), 0, nodesToAppend)
}

function createListOrMerge(node: ElementNode, listType: ListType): MoorListNode {
  if ($isListNode(node)) {
    return node
  }

  const previousSibling = node.getPreviousSibling()
  const nextSibling = node.getNextSibling()
  const listItem = $createListItemNode(listType === 'check' ? 'check' : 'default')
  listItem.setFormat(node.getFormatType())
  listItem.setIndent(node.getIndent())
  append(listItem, node.getChildren())

  if ($isListNode(previousSibling) && listType === previousSibling.getListType()) {
    previousSibling.append(listItem)
    node.remove()
    // if the same type of list is on both sides, merge them.

    if ($isListNode(nextSibling) && listType === nextSibling.getListType()) {
      append(previousSibling, nextSibling.getChildren())
      nextSibling.remove()
    }
    return previousSibling
  } else if ($isListNode(nextSibling) && listType === nextSibling.getListType()) {
    nextSibling.getFirstChildOrThrow().insertBefore(listItem)
    node.remove()
    return nextSibling
  } else {
    const list = $createListNode(listType)
    list.append(listItem)
    node.replace(list)
    // updateChildrenListItemValue(list)
    return list
  }
}

export function isNestedListNode(node: LexicalNode | null | undefined): boolean {
  return $isListItemNode(node) && $isListNode(node.getFirstChild())
}

export function mergeLists(list1: MoorListNode, list2: MoorListNode): void {
  const listItem1 = list1.getLastChild()
  const listItem2 = list2.getFirstChild()

  if (listItem1 && listItem2 && isNestedListNode(listItem1) && isNestedListNode(listItem2)) {
    mergeLists(listItem1.getFirstChild(), listItem2.getFirstChild())
    listItem2.remove()
  }

  const toMerge = list2.getChildren()
  if (toMerge.length > 0) {
    list1.append(...toMerge)
  }

  list2.remove()
}

/**
 * Adds an empty ListNode/ListItemNode chain at listItemNode, so as to
 * create an indent effect. Won't indent ListItemNodes that have a ListNode as
 * a child, but does merge sibling ListItemNodes if one has a nested ListNode.
 * @param listItemNode - The ListItemNode to be indented.
 */
export function $handleIndent(listItemNode: MoorListItemNode): void {
  // go through each node and decide where to move it.
  const removed = new Set<NodeKey>()

  if (isNestedListNode(listItemNode) || removed.has(listItemNode.getKey())) {
    return
  }

  const parent = listItemNode.getParent()

  // We can cast both of the below `isNestedListNode` only returns a boolean type instead of a user-defined type guards
  const nextSibling = listItemNode.getNextSibling<MoorListItemNode>() as MoorListItemNode
  const previousSibling = listItemNode.getPreviousSibling<MoorListItemNode>() as MoorListItemNode
  // if there are nested lists on either side, merge them all together.

  if (isNestedListNode(nextSibling) && isNestedListNode(previousSibling)) {
    const innerList = previousSibling.getFirstChild()

    if ($isListNode(innerList)) {
      innerList.append(listItemNode)
      const nextInnerList = nextSibling.getFirstChild()

      if ($isListNode(nextInnerList)) {
        const children = nextInnerList.getChildren()
        append(innerList, children)
        nextSibling.remove()
        removed.add(nextSibling.getKey())
      }
    }
  } else if (isNestedListNode(nextSibling)) {
    // if the ListItemNode is next to a nested ListNode, merge them
    const innerList = nextSibling.getFirstChild()

    if ($isListNode(innerList)) {
      const firstChild = innerList.getFirstChild()

      if (firstChild !== null) {
        firstChild.insertBefore(listItemNode)
      }
    }
  } else if (isNestedListNode(previousSibling)) {
    const innerList = previousSibling.getFirstChild()

    if ($isListNode(innerList)) {
      innerList.append(listItemNode)
    }
  } else {
    // otherwise, we need to create a new nested ListNode
    if ($isListNode(parent)) {
      const newListItem = $createListItemNode()
      const newList = $createListNode(parent.getListType())
      newListItem.append(newList)
      newList.append(listItemNode)

      if (previousSibling) {
        previousSibling.insertAfter(newListItem)
      } else if (nextSibling) {
        nextSibling.insertBefore(newListItem)
      } else {
        parent.append(newListItem)
      }
    }
  }
}

/**
 * Removes an indent by removing an empty ListNode/ListItemNode chain. An indented ListItemNode
 * has a great grandparent node of type ListNode, which is where the ListItemNode will reside
 * within as a child.
 * @param listItemNode - The ListItemNode to remove the indent (outdent).
 */
export function $handleOutdent(listItemNode: MoorListItemNode): void {
  // go through each node and decide where to move it.

  if (isNestedListNode(listItemNode)) {
    return
  }
  const parentList = listItemNode.getParent()
  const grandparentListItem = parentList ? parentList.getParent() : undefined
  const greatGrandparentList = grandparentListItem ? grandparentListItem.getParent() : undefined
  // If it doesn't have these ancestors, it's not indented.

  if (
    $isListNode(greatGrandparentList) &&
    $isListItemNode(grandparentListItem) &&
    $isListNode(parentList)
  ) {
    // if it's the first child in it's parent list, insert it into the
    // great grandparent list before the grandparent
    const firstChild = parentList ? parentList.getFirstChild() : undefined
    const lastChild = parentList ? parentList.getLastChild() : undefined

    if (listItemNode.is(firstChild)) {
      grandparentListItem.insertBefore(listItemNode)

      if (parentList.isEmpty()) {
        grandparentListItem.remove()
      }
      // if it's the last child in it's parent list, insert it into the
      // great grandparent list after the grandparent.
    } else if (listItemNode.is(lastChild)) {
      grandparentListItem.insertAfter(listItemNode)

      if (parentList.isEmpty()) {
        grandparentListItem.remove()
      }
    } else {
      // otherwise, we need to split the siblings into two new nested lists
      const listType = parentList.getListType()
      const previousSiblingsListItem = $createListItemNode()
      const previousSiblingsList = $createListNode(listType)
      previousSiblingsListItem.append(previousSiblingsList)
      listItemNode.getPreviousSiblings().forEach((sibling) => previousSiblingsList.append(sibling))
      const nextSiblingsListItem = $createListItemNode()
      const nextSiblingsList = $createListNode(listType)
      nextSiblingsListItem.append(nextSiblingsList)
      append(nextSiblingsList, listItemNode.getNextSiblings())
      // put the sibling nested lists on either side of the grandparent list item in the great grandparent.
      grandparentListItem.insertBefore(previousSiblingsListItem)
      grandparentListItem.insertAfter(nextSiblingsListItem)
      // replace the grandparent list item (now between the siblings) with the outdented list item.
      grandparentListItem.replace(listItemNode)
    }
  }
}

export function $handleListInsertParagraph(): boolean {
  const selection = $getSelection()

  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return false
  }
  // Only run this code on empty list items
  const anchor = selection.anchor.getNode()

  if (!$isListItemNode(anchor) || anchor.getChildrenSize() !== 0) {
    return false
  }
  const topListNode = $getTopListNode(anchor)
  const parent = anchor.getParent()

  if (!$isListNode(parent)) {
    throw new Error('A ListItemNode cannot have a ListNode for a parent.')
  }
  const grandparent = parent.getParent()
  let replacementNode

  if ($isRootOrShadowRoot(grandparent)) {
    replacementNode = $createParagraphNode()
    topListNode.insertAfter(replacementNode)
  } else if ($isListItemNode(grandparent)) {
    replacementNode = $createListItemNode()
    grandparent.insertAfter(replacementNode)
  } else {
    return false
  }
  replacementNode.select()

  const nextSiblings = anchor.getNextSiblings()

  if (nextSiblings.length > 0) {
    const newList = $createListNode(parent.getListType())

    if ($isParagraphNode(replacementNode)) {
      replacementNode.insertAfter(newList)
    } else {
      const newListItem = $createListItemNode()
      newListItem.append(newList)
      replacementNode.insertAfter(newListItem)
    }
    nextSiblings.forEach((sibling) => {
      sibling.remove()
      newList.append(sibling)
    })
  }

  // Don't leave hanging nested empty lists
  $removeHighestEmptyListParent(anchor)

  return true
}

export function $getTopListNode(listItem: LexicalNode): MoorListNode {
  let list = listItem.getParent<MoorListNode>()

  if (!$isListNode(list)) {
    throw new Error('A ListItemNode cannot have a ListNode for a parent.')
  }

  let parent: MoorListNode | null = list

  while (parent !== null) {
    parent = parent.getParent()

    if ($isListNode(parent)) {
      list = parent
    }
  }

  return list
}

export function $removeHighestEmptyListParent(sublist: MoorListItemNode | MoorListNode) {
  // Nodes may be repeatedly indented, to create deeply nested lists that each
  // contain just one bullet.
  // Our goal is to remove these (empty) deeply nested lists. The easiest
  // way to do that is crawl back up the tree until we find a node that has siblings
  // (e.g. is actually part of the list contents) and delete that, or delete
  // the root of the list (if no list nodes have siblings.)
  let emptyListPtr = sublist

  while (emptyListPtr.getNextSibling() == null && emptyListPtr.getPreviousSibling() == null) {
    const parent = emptyListPtr.getParent<MoorListItemNode | MoorListNode>()

    if (parent == null || !($isListItemNode(emptyListPtr) || $isListNode(emptyListPtr))) {
      break
    }

    emptyListPtr = parent
  }

  emptyListPtr.remove()
}

export function $getListDepth(listNode: MoorListNode): number {
  let depth = 1
  let parent = listNode.getParent()

  while (parent != null) {
    if ($isListItemNode(parent)) {
      const parentList = parent.getParent()

      if ($isListNode(parentList)) {
        depth++
        parent = parentList.getParent()
        continue
      }
      throw new Error('A ListItemNode must have a ListNode for a parent.')
    }

    return depth
  }

  return depth
}

/**
 * A recursive Depth-First Search (Postorder Traversal) that finds all of a node's children
 * that are of type ListItemNode and returns them in an array.
 * @param node - The ListNode to start the search.
 * @returns An array containing all nodes of type ListItemNode found.
 */
// This should probably be $getAllChildrenOfType
export function $getAllListItems(node: MoorListNode): Array<MoorListItemNode> {
  let listItemNodes: Array<MoorListItemNode> = []
  const listChildren: Array<MoorListItemNode> = node.getChildren().filter($isListItemNode)

  for (let i = 0; i < listChildren.length; i++) {
    const listItemNode = listChildren[i]
    const firstChild = listItemNode.getFirstChild()

    if ($isListNode(firstChild)) {
      listItemNodes = listItemNodes.concat($getAllListItems(firstChild))
    } else {
      listItemNodes.push(listItemNode)
    }
  }

  return listItemNodes
}
