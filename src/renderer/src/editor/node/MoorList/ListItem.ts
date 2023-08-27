import {
  $isParagraphNode,
  $isRangeSelection,
  EditorConfig,
  EditorThemeClasses,
  ElementNode,
  GridSelection,
  LexicalEditor,
  LexicalNode,
  NodeSelection,
  ParagraphNode,
  RangeSelection,
  SerializedElementNode,
  Spread
} from 'lexical'
import { addClassNamesToElement, removeClassNamesFromElement } from '@lexical/utils'
import { $createListNode, $isListNode } from './List'
import { ListNode } from '@lexical/list'
import { $handleIndent, $handleOutdent, isNestedListNode, mergeLists } from './utils'

export type ListItemType = 'default' | 'check'

export type SerializedListItemNode = Spread<
  {
    itemType: ListItemType
    isChecked: boolean
    createTime?: number
    checkedTime?: number
  },
  SerializedElementNode
>

export class MoorListItemNode extends ElementNode {
  __itemType: ListItemType

  __isChecked: boolean

  __createTime?: number

  __checkedTime?: number

  static getType(): string {
    return 'listitem'
  }

  static clone(node: MoorListItemNode): MoorListItemNode {
    return new MoorListItemNode(
      node.__itemType,
      node.__isChecked,
      node.__checkedTime,
      node.__createTime,
      node.__key
    )
  }

  constructor(
    type: ListItemType = 'default',
    checked?: boolean,
    checkTime?: number,
    createTime?: number,
    key?: string
  ) {
    super(key)
    this.__itemType = type
    this.__isChecked = checked || false
    this.__checkedTime = checkTime
    this.__createTime = createTime || Date.now()
  }

  createDOM(config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const li = document.createElement('li')
    if (this.__itemType === 'check') {
      // input checkbox
      li.dataset.type = 'checkListItem'
      const input = document.createElement('input')
      input.type = 'checkbox'
      input.addEventListener('change', (event): void => {
        const target = event.target as HTMLInputElement
        _editor.update(() => {
          this.setChecked(target.checked)
          if (target.checked) {
            this.setCheckedTime(Date.now())
          }
        })
      })
      input.checked = this.__isChecked
      li.appendChild(input)
    }
    setListItemThemeClassNames(li, config.theme, this)
    return li
  }

  updateDOM(prevNode: MoorListItemNode, dom: HTMLElement, _config: EditorConfig): boolean {
    if (prevNode.__itemType !== this.__itemType) {
      if (this.__itemType === 'check') {
        dom.dataset.type = 'checkListItem'
      } else {
        dom.dataset.type = ''
      }
    }
    setListItemThemeClassNames(dom, _config.theme, this)
    return false
  }

  exportJSON(): SerializedListItemNode {
    return {
      ...super.exportJSON(),
      itemType: this.__itemType,
      isChecked: this.__isChecked,
      createTime: this.__createTime,
      checkedTime: this.__checkedTime,
      type: 'listitem',
      version: 1
    }
  }

  static importJSON(serializedNode: SerializedListItemNode): MoorListItemNode {
    const node = $createListItemNode(serializedNode.itemType)
    node.setFormat(serializedNode.format)
    node.setIndent(serializedNode.indent)
    node.setDirection(serializedNode.direction)
    node.setChecked(serializedNode.isChecked)
    if (serializedNode.checkedTime) {
      node.setCheckedTime(serializedNode.checkedTime)
    }
    if (serializedNode.createTime) {
      node.setCreateTime(serializedNode.createTime)
    }
    return node
  }

  getType(): ListItemType {
    return this.__itemType
  }

  setType(type: ListItemType): void {
    const writable = this.getWritable()
    writable.__itemType = type
  }

  isCheckItem(): boolean {
    return this.__itemType === 'check'
  }

  isChecked(): boolean {
    return this.__isChecked
  }

  setChecked(checked: boolean): void {
    const writable = this.getWritable()
    writable.__isChecked = checked
    if (checked) {
      writable.__checkedTime = Date.now()
    }
  }

  getItemType(): ListItemType {
    return this.__itemType
  }

  setItemType(type: ListItemType): void {
    const writable = this.getWritable()
    writable.__itemType = type
  }

  getCreateTime(): number | undefined {
    return this.__createTime
  }

  setCreateTime(time: number): void {
    const writable = this.getWritable()
    writable.__createTime = time
  }

  getCheckedTime(): number | undefined {
    return this.__checkedTime
  }

  setCheckedTime(time: number): void {
    const writable = this.getWritable()
    writable.__checkedTime = time
  }

  getIndent(): number {
    // If we don't have a parent, we are likely serializing
    const parent = this.getParent()
    if (parent === null) {
      return this.getLatest().__indent
    }
    // ListItemNode should always have a ListNode for a parent.
    let listNodeParent = parent.getParentOrThrow()
    let indentLevel = 0
    while ($isListItemNode(listNodeParent)) {
      listNodeParent = listNodeParent.getParentOrThrow().getParentOrThrow()
      indentLevel++
    }
    return indentLevel
  }

  setIndent(indent: number): this {
    if (indent < 0) {
      throw new Error('Invalid indent value.')
    }
    let currentIndent = this.getIndent()
    while (currentIndent !== indent) {
      if (currentIndent < indent) {
        $handleIndent(this)
        currentIndent++
      } else {
        $handleOutdent(this)
        currentIndent--
      }
    }
    return this
  }

  replace<N extends LexicalNode>(replaceWithNode: N, includeChildren?: boolean): N {
    if ($isListItemNode(replaceWithNode)) {
      return super.replace(replaceWithNode)
    }
    this.setIndent(0)
    const list = this.getParentOrThrow()
    if (!$isListNode(list)) return replaceWithNode
    if (list.__first === this.getKey()) {
      list.insertBefore(replaceWithNode)
    } else if (list.__last === this.getKey()) {
      list.insertAfter(replaceWithNode)
    } else {
      // Split the list
      const newList = $createListNode(list.getListType())
      let nextSibling = this.getNextSibling()
      while (nextSibling) {
        const nodeToAppend = nextSibling
        nextSibling = nextSibling.getNextSibling()
        newList.append(nodeToAppend)
      }
      list.insertAfter(replaceWithNode)
      replaceWithNode.insertAfter(newList)
    }
    if (includeChildren) {
      this.getChildren().forEach((child: LexicalNode) => {
        replaceWithNode.append(child)
      })
    }
    this.remove()
    if (list.getChildrenSize() === 0) {
      list.remove()
    }
    return replaceWithNode
  }

  insertAfter(node: LexicalNode, restoreSelection = true): LexicalNode {
    const parentNode = this.getParentOrThrow()

    if (!$isListNode(parentNode)) {
      throw new Error('insertAfter: list node is not parent of list item node')
    }

    const siblings = this.getNextSiblings()

    if ($isListItemNode(node)) {
      const after = super.insertAfter(node, restoreSelection)
      return after
    }

    // Attempt to merge if the list is of the same type.
    if ($isListNode(node)) {
      let child = node
      const children = node.getChildren<ListNode>()
      for (let i = children.length - 1; i >= 0; i--) {
        child = children[i]
        this.insertAfter(child, restoreSelection)
      }
      return child
    }

    // Otherwise, split the list
    // Split the lists and insert the node in between them
    parentNode.insertAfter(node, restoreSelection)
    if (siblings.length !== 0) {
      const newListNode = $createListNode(parentNode.getListType())
      siblings.forEach((sibling) => newListNode.append(sibling))
      node.insertAfter(newListNode, restoreSelection)
    }
    return node
  }

  remove(preserveEmptyParent?: boolean): void {
    const prevSibling = this.getPreviousSibling()
    const nextSibling = this.getNextSibling()
    super.remove(preserveEmptyParent)

    if (
      prevSibling &&
      nextSibling &&
      isNestedListNode(prevSibling) &&
      isNestedListNode(nextSibling)
    ) {
      mergeLists(prevSibling.getFirstChild(), nextSibling.getFirstChild())
      nextSibling.remove()
    }
  }

  insertNewAfter(_: RangeSelection, restoreSelection = true): MoorListItemNode | ParagraphNode {
    const newElement = $createListItemNode(this.__itemType === 'check' ? 'check' : 'default')
    this.insertAfter(newElement, restoreSelection)
    return newElement
  }

  insertBefore(nodeToInsert: LexicalNode): LexicalNode {
    return super.insertBefore(nodeToInsert)
  }

  canInsertAfter(node: LexicalNode): boolean {
    return $isListItemNode(node)
  }

  canReplaceWith(replacement: LexicalNode): boolean {
    return $isListItemNode(replacement)
  }

  canMergeWith(node: LexicalNode): boolean {
    return $isParagraphNode(node) || $isListItemNode(node)
  }

  extractWithChild(
    child: LexicalNode,
    selection: RangeSelection | NodeSelection | GridSelection
  ): boolean {
    if (!$isRangeSelection(selection)) {
      return false
    }

    const anchorNode = selection.anchor.getNode()
    const focusNode = selection.focus.getNode()

    return (
      this.isParentOf(anchorNode) &&
      this.isParentOf(focusNode) &&
      this.getTextContent().length === selection.getTextContent().length
    )
  }

  isParentRequired(): true {
    return true
  }

  createParentElementNode(): ElementNode {
    return $createListNode('bullet')
  }
}

export function $isListItemNode(node: LexicalNode | null | undefined): node is MoorListItemNode {
  return node instanceof MoorListItemNode
}

export function $isCheckListItemNode(node: LexicalNode | null | undefined): boolean {
  return $isListItemNode(node) && node.isCheckItem()
}

export function $createListItemNode(type?: ListItemType, checked?: boolean): MoorListItemNode {
  return new MoorListItemNode(type, checked)
}

function setListItemThemeClassNames(
  dom: HTMLElement,
  editorThemeClasses: EditorThemeClasses,
  node: MoorListItemNode
): void {
  const classesToAdd = []
  const classesToRemove = []
  const listTheme = editorThemeClasses.list
  const listItemClassName = listTheme ? listTheme.listitem : undefined
  let nestedListItemClassName

  if (listTheme && listTheme.nested) {
    nestedListItemClassName = listTheme.nested.listitem
  }

  if (listItemClassName !== undefined) {
    const listItemClasses = listItemClassName.split(' ')
    classesToAdd.push(...listItemClasses)
  }

  if (listTheme) {
    const parentNode = node.getParent()
    const isCheckList = $isListNode(parentNode) && parentNode.getListType() === 'check'
    const checked = node.isChecked() === true

    if (!isCheckList || checked) {
      classesToRemove.push(listTheme.listitemUnchecked)
    }

    if (!isCheckList || !checked) {
      classesToRemove.push(listTheme.listitemChecked)
    }

    if (isCheckList) {
      classesToAdd.push(checked ? listTheme.listitemChecked : listTheme.listitemUnchecked)
    }
  }

  if (nestedListItemClassName !== undefined) {
    const nestedListItemClasses = nestedListItemClassName.split(' ')

    if (node.getChildren().some((child) => $isListNode(child))) {
      classesToAdd.push(...nestedListItemClasses)
    } else {
      classesToRemove.push(...nestedListItemClasses)
    }
  }

  if (classesToRemove.length > 0) {
    removeClassNamesFromElement(dom, ...classesToRemove)
  }

  if (classesToAdd.length > 0) {
    addClassNamesToElement(dom, ...classesToAdd)
  }
}
