import {
  $createListNode,
  $isListNode,
  ListType,
  MoorListNode
} from '@renderer/editor/node/MoorList/List'
import {
  $createListItemNode,
  $isListItemNode,
  MoorListItemNode
} from '@renderer/editor/node/MoorList/ListItem'
import { ElementTransformer } from '@lexical/markdown'
import { ElementNode } from 'lexical'

const LIST_INDENT_SIZE = 4

const listReplace = (listType: ListType): ElementTransformer['replace'] => {
  return (parentNode, children, match) => {
    const previousNode = parentNode.getPreviousSibling()
    const nextNode = parentNode.getNextSibling()
    const isChecked = listType === 'check' ? match[3] === 'x' : false
    const listItem = $createListItemNode(listType === 'check' ? 'check' : 'default', isChecked)
    if ($isListNode(nextNode) && nextNode.getListType() === listType) {
      const firstChild = nextNode.getFirstChild()
      if (firstChild !== null) {
        firstChild.insertBefore(listItem)
      } else {
        // should never happen, but let's handle gracefully, just in case.
        nextNode.append(listItem)
      }
      parentNode.remove()
    } else if ($isListNode(previousNode) && previousNode.getListType() === listType) {
      previousNode.append(listItem)
      parentNode.remove()
    } else {
      const list = $createListNode(listType)
      list.append(listItem)
      parentNode.replace(list)
    }
    listItem.append(...children)
    listItem.select(0, 0)
    const indent = Math.floor(match[1].length / LIST_INDENT_SIZE)
    if (indent) {
      listItem.setIndent(indent)
    }
  }
}

const listExport = (
  listNode: MoorListNode,
  exportChildren: (node: ElementNode) => string,
  depth: number
): string => {
  const output = []
  const children = listNode.getChildren()
  let index = 0
  for (const listItemNode of children) {
    if ($isListItemNode(listItemNode)) {
      if (listItemNode.getChildrenSize() === 1) {
        const firstChild = listItemNode.getFirstChild()
        if ($isListNode(firstChild)) {
          output.push(listExport(firstChild, exportChildren, depth + 1))
          continue
        }
      }
      const indent = ' '.repeat(depth * LIST_INDENT_SIZE)
      const listType = listNode.getListType()
      const prefix =
        listType === 'number'
          ? `${listNode.getStart() + index}. `
          : listType === 'check'
          ? `- [${listItemNode.getChecked() ? 'x' : ' '}] `
          : '- '
      output.push(indent + prefix + exportChildren(listItemNode))
      index++
    }
  }

  return output.join('\n')
}

export const ORDERED_LIST: ElementTransformer = {
  dependencies: [MoorListNode, MoorListItemNode],
  export: (node, exportChildren) => {
    return $isListNode(node) ? listExport(node, exportChildren, 0) : null
  },
  regExp: /^(\s*)(\d{1,})\.\s/,
  replace: listReplace('number'),
  type: 'element'
}

export const UNORDERED_LIST: ElementTransformer = {
  dependencies: [MoorListNode, MoorListItemNode],
  export: (node, exportChildren) => {
    return $isListNode(node) ? listExport(node, exportChildren, 0) : null
  },
  regExp: /^(\s*)[-*+]\s/,
  replace: listReplace('bullet'),
  type: 'element'
}

export const CHECK_LIST: ElementTransformer = {
  dependencies: [MoorListNode, MoorListItemNode],
  export: (node, exportChildren) => {
    return $isListNode(node) ? listExport(node, exportChildren, 0) : null
  },
  regExp: /^(\s*)(?:-\s)?\s?(\[(\s|x)?\])\s/i,
  replace: listReplace('check'),
  type: 'element'
}
