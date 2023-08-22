import { EditorSelection } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { selectAll as cmSelectAll } from '@codemirror/commands'
import {
  $createNodeSelection,
  $getNodeByKey,
  $getSelection,
  $isDecoratorNode,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_DOWN_COMMAND,
  LexicalEditor,
  LexicalNode,
  NodeKey
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import { CodeblockLayout } from '..'

function doSelect(
  editor: LexicalEditor,
  nodeKey: NodeKey,
  layout: CodeblockLayout,
  cursorNumber: number,
  codeMirror: EditorView | null | undefined
): void {
  if (layout === CodeblockLayout.Preview) {
    // only selectNode
    selectDecoratorNode(editor, nodeKey)
  } else {
    // focus codemirror
    codeMirror?.focus()
    codeMirror?.dispatch({
      selection: EditorSelection.cursor(cursorNumber)
    })
  }
}

function selectNode(editor: LexicalEditor, node: LexicalNode | null): void {
  if ($isElementNode(node)) {
    node.select()
    return
  }
  if ($isDecoratorNode(node)) {
    selectDecoratorNode(editor, node.getKey())
    return
  }
}

function selectDecoratorNode(editor: LexicalEditor, nodeKey: NodeKey): void {
  editor.update(() => {
    const ns = $createNodeSelection()
    ns.add(nodeKey)
    $setSelection(ns)
  })
}

export function codeMirrorNodeListener(
  editor: LexicalEditor,
  nodeKey: NodeKey,
  layout: CodeblockLayout,
  codeMirror: EditorView | null | undefined
): () => void {
  return mergeRegister(
    editor.registerCommand<KeyboardEvent>(
      KEY_ARROW_DOWN_COMMAND,
      (event, targetEditor) => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const topEle = selection.anchor.getNode().getTopLevelElement()
          if (topEle && topEle.getNextSibling()) {
            if (topEle.getNextSibling()?.getKey() === nodeKey) {
              event.preventDefault()
              event.stopImmediatePropagation()
              doSelect(editor, nodeKey, layout, 0, codeMirror)
              return true
            } else if (topEle.getKey() === nodeKey) {
              event.preventDefault()
              event.stopImmediatePropagation()
              selectNode(editor, topEle.getNextSibling())
              return true
            }
          }
        }
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes()
          if (nodes.length === 1) {
            const topEle = nodes[0].getTopLevelElement()
            if (topEle && topEle.getNextSibling()) {
              if (topEle.getNextSibling()?.getKey() === nodeKey) {
                event.preventDefault()
                event.stopImmediatePropagation()
                doSelect(editor, nodeKey, layout, 0, codeMirror)
                return true
              } else if (topEle.getKey() === nodeKey) {
                event.preventDefault()
                event.stopImmediatePropagation()
                selectNode(editor, topEle.getNextSibling())
                return true
              }
            }
          }
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
          if (topEle && topEle.getPreviousSibling()) {
            if (topEle.getPreviousSibling()?.getKey() === nodeKey) {
              event.preventDefault()
              event.stopImmediatePropagation()
              const cursorNumber = codeMirror ? codeMirror.state.doc.length : 0
              doSelect(editor, nodeKey, layout, cursorNumber, codeMirror)
              return true
            } else if (topEle.getKey() === nodeKey) {
              event.preventDefault()
              event.stopImmediatePropagation()
              selectNode(editor, topEle.getPreviousSibling())
              return true
            }
          }
        }
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes()
          if (nodes.length === 1) {
            const topEle = nodes[0].getTopLevelElement()
            if (topEle && topEle.getPreviousSibling()) {
              if (topEle.getPreviousSibling()?.getKey() === nodeKey) {
                event.preventDefault()
                event.stopImmediatePropagation()
                const cursorNumber = codeMirror ? codeMirror.state.doc.length : 0
                doSelect(editor, nodeKey, layout, cursorNumber, codeMirror)
                return true
              } else if (topEle.getKey() === nodeKey) {
                event.preventDefault()
                event.stopImmediatePropagation()
                selectNode(editor, topEle.getPreviousSibling())
                return true
              }
            }
          }
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    ),
    editor.registerCommand<KeyboardEvent>(
      KEY_DOWN_COMMAND,
      (event, targetEditor): boolean => {
        // delegate select_all to codemirror
        if (event.ctrlKey || event.metaKey) {
          if (event.key === 'a') {
            if (codeMirror && codeMirror.hasFocus) {
              event.preventDefault()
              event.stopImmediatePropagation()
              cmSelectAll(codeMirror)
              return true
            }
          }
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  )
}
