import { EditorView } from '@codemirror/view'
import { useState } from 'react'
import { GoCopy } from 'react-icons/go'
import { MdOutlineDone } from 'react-icons/md'

export function CopyButton(props: { codeMirror: EditorView }): JSX.Element {
  const [isDone, setIsDone] = useState(false)
  const copy = (): void => {
    const data = props.codeMirror.state.doc.toString()
    navigator.clipboard.writeText(data)
    setIsDone(true)
  }

  const onMouseLeave = (): void => {
    setTimeout(() => {
      setIsDone(false)
    }, 1500)
  }
  return (
    <>
      <button
        onClick={(): void => copy()}
        onMouseLeave={(): void => onMouseLeave()}
        className="copy-button"
      >
        {isDone ? <MdOutlineDone /> : <GoCopy />}
      </button>
    </>
  )
}
