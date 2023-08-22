import { Command as CodeMirrorCommand, EditorView as CodeMirrorEditorView } from '@codemirror/view'
import {
  $createNodeSelection,
  $createParagraphNode,
  $getNodeByKey,
  $isDecoratorNode,
  $isElementNode,
  $setSelection,
  LexicalEditor,
  LexicalNode,
  NodeKey
} from 'lexical'

export function codeMirrorArrowKeyDelegate(
  editor: LexicalEditor,
  nodeKey: NodeKey,
  unit: 'line' | 'char',
  dir: 1 | -1
): CodeMirrorCommand {
  return (view: CodeMirrorEditorView) => {
    const { state } = view
    // Exit if the selection is not empty
    if (state.selection.ranges.some((range) => !range.empty)) {
      return false
    }

    const anchor = state.selection.main.anchor
    const line = state.doc.lineAt(anchor)
    const lineOffset = anchor - line.from

    if (
      line.number !== (dir < 0 ? 1 : state.doc.lines) ||
      (unit === 'char' && lineOffset !== (dir < 0 ? 0 : line.length))
    ) {
      return false
    }

    editor.update(() => {
      const node = $getNodeByKey(nodeKey)!
      if (dir < 0) {
        const previousSibling = node.getPreviousSibling()
        if (previousSibling && previousSibling.getTopLevelElement()) {
          view?.contentDOM.blur()
          focusAndSelectNode(editor, previousSibling.getTopLevelElement())
        } else {
          node.insertBefore($createParagraphNode())
        }
      } else {
        const nextSibling = node.getNextSibling()
        if (nextSibling) {
          view?.contentDOM.blur()
          focusAndSelectNode(editor, nextSibling.getTopLevelElement())
        } else {
          node.insertAfter($createParagraphNode())
        }
      }
    })
    return true
  }
}

function focusAndSelectNode(editor: LexicalEditor, node: LexicalNode | null | undefined): void {
  const activeElement = document.activeElement
  const rootElement = editor.getRootElement() as HTMLDivElement
  if (rootElement !== null && (activeElement === null || !rootElement.contains(activeElement))) {
    // Note: preventScroll won't work in Webkit.
    rootElement.focus({ preventScroll: true })
  }
  selectElementNodeIfNecessary(node)
  selectDecoratorNodeIfNecessary(node)
}

function selectElementNodeIfNecessary(node: LexicalNode | null | undefined): void {
  if (node == null) {
    return
  }
  if ($isElementNode(node)) {
    node.select()
  }
}

function selectDecoratorNodeIfNecessary(node: LexicalNode | null | undefined): void {
  if (node == null) {
    return
  }

  if ($isDecoratorNode(node)) {
    const ns = $createNodeSelection()
    ns.add(node.getKey())
    $setSelection(ns)
  }
}
