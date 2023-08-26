import {
  LexicalEditor,
  $getSelection,
  $isRangeSelection,
  $getRoot,
  TextNode,
  ElementNode,
  LexicalNode,
  $createNodeSelection,
  $isDecoratorNode,
  $isElementNode,
  $setSelection,
  NodeKey,
  $isParagraphNode
} from 'lexical'

export function isSingleRangeSelection(editor: LexicalEditor): boolean {
  return editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const anchor = selection.anchor
      const focus = selection.focus
      return anchor.key === focus.key && anchor.offset === focus.offset
    }
    return false
  })
}

export function isAtBottomLine(editor: LexicalEditor): boolean {
  return editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const focusKey = selection.focus.key
      const root = $getRoot()
      const lastChild = root.getLastDescendant()
      if (lastChild && focusKey === lastChild.__key) {
        return true
      }
    }
    return false
  })
}

export function isAtHeadLine(editor: LexicalEditor): boolean {
  return editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const focusKey = selection.focus.key
      const root = $getRoot()
      const firstChild = root.getFirstDescendant()
      if (firstChild && focusKey === firstChild.__key) {
        return true
      }
    }
    return false
  })
}

export function findClosestNextSibling(
  node: ElementNode | TextNode | LexicalNode | null
): LexicalNode | null {
  if (node == null) {
    return null
  }
  if (node instanceof TextNode) {
    return findClosestNextSibling(node.getParent())
  }
  const nextSibling = node.getNextSibling()
  if (nextSibling == null) {
    return findClosestNextSibling(node.getParent())
  }
  return nextSibling
}

export function findClosestPrevSibling(
  node: ElementNode | TextNode | LexicalNode | null
): LexicalNode | null {
  if (node == null) {
    return null
  }
  if (node instanceof TextNode) {
    return findClosestPrevSibling(node.getParent())
  }
  const nextSibling = node.getPreviousSibling()
  if (nextSibling == null) {
    return findClosestPrevSibling(node.getParent())
  }
  return nextSibling
}

export function selectByNodeType(node: LexicalNode | ElementNode | null | undefined): boolean {
  if ($isElementNode(node)) {
    $setSelection(null)
    node.selectStart()
    return true
  }
  if ($isDecoratorNode(node)) {
    // fallback to select the node
    $setSelection(null)
    const ns = $createNodeSelection()
    ns.add(node.getKey())
    $setSelection(ns)
    return true
  }
  return false
}

export function focusEditorDom(editor: LexicalEditor): void {
  const activeElement = document.activeElement
  const rootElement = editor.getRootElement() as HTMLDivElement
  if (rootElement !== null && (activeElement === null || !rootElement.contains(activeElement))) {
    // Note: preventScroll won't work in Webkit.
    rootElement.focus({ preventScroll: true })
  }
}

export function getNodeByEditor(editor: LexicalEditor, nodeKey: NodeKey): LexicalNode | undefined {
  const editorState = editor.getEditorState()
  return editorState._nodeMap.get(nodeKey)
}

export function isEmptyParagraph(node: LexicalNode | null): boolean {
  if ($isParagraphNode(node) && node.getChildren().length === 0) {
    return true
  }
  return false
}
