/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { addClassNamesToElement, isHTMLElement, removeClassNamesFromElement } from '@lexical/utils'
import {
  $applyNodeReplacement,
  $createParagraphNode,
  $createTextNode,
  $isElementNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  EditorThemeClasses,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread
} from 'lexical'
import { $createListItemNode, $isListItemNode, MoorListItemNode } from './ListItem'
import { $getListDepth } from './utils'

export type SerializedListNode = Spread<
  {
    listType: ListType
  },
  SerializedElementNode
>

export type ListType = 'number' | 'bullet' | 'check'

export type ListNodeTagType = 'ul' | 'ol'

export class MoorListNode extends ElementNode {
  __listType: ListType

  static getType(): string {
    return 'list'
  }

  static clone(node: MoorListNode): MoorListNode {
    const listType = node.__listType
    return new MoorListNode(listType, node.__key)
  }

  constructor(listType: ListType, key?: NodeKey) {
    super(key)
    this.__listType = listType
  }

  setListType(type: ListType): void {
    const writable = this.getWritable()
    writable.__listType = type
  }

  getListType(): ListType {
    return this.__listType
  }

  createDOM(config: EditorConfig, _editor?: LexicalEditor): HTMLElement {
    const tag = this.__listType === 'number' ? 'ol' : 'ul'
    const dom = document.createElement(tag)
    //@ts-ignore
    dom.__moorListType = this.__listType

    const dataType = this.__listType === 'check' ? 'checkList' : 'list'
    dom.dataset.type = dataType
    setListThemeClassNames(dom, config.theme, this)
    return dom
  }

  updateDOM(prevNode: MoorListNode, dom: HTMLElement, config: EditorConfig): boolean {
    if (prevNode.__listType !== this.__listType) {
      if (this.__itemType === 'check') {
        dom.dataset.type = 'checkList'
      } else {
        dom.dataset.type = 'list'
      }
      return true
    }
    setListThemeClassNames(dom, config.theme, this)
    return false
  }

  static importDOM(): DOMConversionMap | null {
    return {
      ol: (node: Node) => ({
        conversion: convertListNode,
        priority: 0
      }),
      ul: (node: Node) => ({
        conversion: convertListNode,
        priority: 0
      })
    }
  }

  static importJSON(serializedNode: SerializedListNode): MoorListNode {
    const node = $createListNode(serializedNode.listType)
    node.setFormat(serializedNode.format)
    node.setIndent(serializedNode.indent)
    node.setDirection(serializedNode.direction)
    return node
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor)
    if (element) {
      if (this.__listType === 'check') {
        element.setAttribute('__moorListType', 'check')
      }
    }
    return {
      element
    }
  }

  exportJSON(): SerializedListNode {
    return {
      ...super.exportJSON(),
      listType: this.getListType(),
      type: 'list',
      version: 1
    }
  }

  canBeEmpty(): false {
    return false
  }

  canIndent(): false {
    return false
  }

  append(...nodesToAppend: LexicalNode[]): this {
    for (let i = 0; i < nodesToAppend.length; i++) {
      const currentNode = nodesToAppend[i]
      const itemType = this.__listType === 'check' ? 'check' : 'default'
      if ($isListItemNode(currentNode)) {
        currentNode.setItemType(itemType)
        super.append(currentNode)
      } else {
        const listItemNode = $createListItemNode(itemType)
        if ($isListNode(currentNode)) {
          listItemNode.append(currentNode)
        } else if ($isElementNode(currentNode)) {
          const textNode = $createTextNode(currentNode.getTextContent())
          listItemNode.append(textNode)
        } else {
          listItemNode.append(currentNode)
        }
        super.append(listItemNode)
      }
    }
    // updateChildrenListItemValue(this)
    return this
  }

  extractWithChild(child: LexicalNode): boolean {
    return $isListItemNode(child)
  }
}

function setListThemeClassNames(
  dom: HTMLElement,
  editorThemeClasses: EditorThemeClasses,
  node: MoorListNode
): void {
  const classesToAdd = []
  const classesToRemove = []
  const listTheme = editorThemeClasses.list

  if (listTheme !== undefined) {
    const listLevelsClassNames = listTheme[`${node.__tag}Depth`] || []
    const listDepth = $getListDepth(node) - 1
    const normalizedListDepth = listDepth % listLevelsClassNames.length
    const listLevelClassName = listLevelsClassNames[normalizedListDepth]
    const listClassName = listTheme[node.__tag]
    let nestedListClassName
    const nestedListTheme = listTheme.nested

    if (nestedListTheme !== undefined && nestedListTheme.list) {
      nestedListClassName = nestedListTheme.list
    }

    if (listClassName !== undefined) {
      classesToAdd.push(listClassName)
    }

    if (listLevelClassName !== undefined) {
      const listItemClasses = listLevelClassName.split(' ')
      classesToAdd.push(...listItemClasses)
      for (let i = 0; i < listLevelsClassNames.length; i++) {
        if (i !== normalizedListDepth) {
          classesToRemove.push(node.__tag + i)
        }
      }
    }

    if (nestedListClassName !== undefined) {
      const nestedListItemClasses = nestedListClassName.split(' ')

      if (listDepth > 1) {
        classesToAdd.push(...nestedListItemClasses)
      } else {
        classesToRemove.push(...nestedListItemClasses)
      }
    }
  }

  if (classesToRemove.length > 0) {
    removeClassNamesFromElement(dom, ...classesToRemove)
  }

  if (classesToAdd.length > 0) {
    addClassNamesToElement(dom, ...classesToAdd)
  }
}

function normalizeChildren(nodes: Array<LexicalNode>): Array<MoorListItemNode> {
  const normalizedListItems: Array<MoorListItemNode> = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if ($isListItemNode(node)) {
      normalizedListItems.push(node)
      const children = node.getChildren()
      if (children.length > 1) {
        children.forEach((child) => {
          if ($isListNode(child)) {
            normalizedListItems.push(wrapInListItem(child))
          }
        })
      }
    } else {
      normalizedListItems.push(wrapInListItem(node))
    }
  }
  return normalizedListItems
}

function convertListNode(domNode: Node): DOMConversionOutput {
  const nodeName = domNode.nodeName.toLowerCase()
  let node: MoorListNode | null = null
  if (nodeName === 'ol') {
    // @ts-ignore
    const start = domNode.start
    node = $createListNode('number')
  } else if (nodeName === 'ul') {
    if (isHTMLElement(domNode) && domNode.getAttribute('__moorListType') === 'check') {
      node = $createListNode('check')
    } else {
      node = $createListNode('bullet')
    }
  }

  return {
    after: normalizeChildren,
    node
  }
}
export function wrapInListItem(node: LexicalNode): MoorListItemNode {
  const listItemWrapper = $createListItemNode()
  return listItemWrapper.append(node)
}

export function $createListNode(listType: ListType): MoorListNode {
  return $applyNodeReplacement(new MoorListNode(listType))
}

export function $isListNode(node: LexicalNode | null | undefined): node is MoorListNode {
  return node instanceof MoorListNode
}
