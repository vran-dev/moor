import { EditorView } from '@codemirror/view'
import { ReactNode, useEffect } from 'react'

export function useCodeMirrorDataUpdate(props: {
  codeMirror: EditorView | null | undefined
  data: string
}): ReactNode {
  const { codeMirror, data } = props
  useEffect(() => {
    if (!codeMirror) {
      return
    }
    const newText = data || ''
    const curText = codeMirror.state.doc.toString()
    if (newText != curText) {
      let start = 0,
        curEnd = curText.length,
        newEnd = newText.length
      while (start < curEnd && curText.charCodeAt(start) == newText.charCodeAt(start)) {
        ++start
      }
      while (
        curEnd > start &&
        newEnd > start &&
        curText.charCodeAt(curEnd - 1) == newText.charCodeAt(newEnd - 1)
      ) {
        curEnd--
        newEnd--
      }
      codeMirror.dispatch({
        changes: {
          from: start,
          to: curEnd,
          insert: newText.slice(start, newEnd)
        }
      })
    }
  }, [codeMirror, data])
  return null
}
