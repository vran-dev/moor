import { EditorView } from '@codemirror/view'
import { focusEditorDom } from '@renderer/editor/utils/EditorHelper'
import { $createParagraphNode, $getNodeByKey, LexicalEditor, NodeKey } from 'lexical'

export function codeMirrorCtrlEnterKeyDelegate(
  editor: LexicalEditor,
  codeMirror: EditorView,
  nodeKey: NodeKey
): boolean {
  const { state } = codeMirror
  if (state.selection.ranges.some((range) => !range.empty)) {
    return false
  }
  const totalLines = state.doc.lines
  const anchor = state.selection.main.anchor
  const line = state.doc.lineAt(anchor)
  if (line.number === totalLines) {
    // tiple enter: delete prev empty line then blur codemirror, finally insert a paragraph node
    editor.update(() => {
      codeMirror?.contentDOM.blur()
      focusEditorDom(editor)
      const node = $getNodeByKey(nodeKey)!
      const paragraph = $createParagraphNode()
      node.insertAfter(paragraph)
      paragraph.select()
    })
    return true
  } else {
    return false
  }
}

export function codeMirrorTripleEnterKeyDelegate(
  editor: LexicalEditor,
  codeMirror: EditorView,
  nodeKey: NodeKey
): boolean {
  const { state } = codeMirror
  if (state.selection.ranges.some((range) => !range.empty)) {
    return false
  }
  const totalLines = state.doc.lines
  if (totalLines < 3) {
    return false
  }
  const anchor = state.selection.main.anchor
  const currentLine = state.doc.lineAt(anchor)

  // previous 3 lines are empty
  for (let i = 0; i < 3; i++) {
    const line = state.doc.line(currentLine.number - i)
    if (line.text.length > 0) {
      return false
    }
  }

  // delete last 3 lines in Codemirror
  codeMirror.dispatch({
    changes: [
      {
        from: state.doc.line(totalLines - 2).from,
        to: state.doc.line(totalLines).to,
        insert: ''
      }
    ]
  })

  editor.update(() => {
    codeMirror?.contentDOM.blur()
    focusEditorDom(editor)
    const node = $getNodeByKey(nodeKey)!
    const paragraph = $createParagraphNode()
    node.insertAfter(paragraph)
    paragraph.select()
  })
  return true
}
