import { Compartment } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useEffect, useState } from 'react'
import { TbTextWrap, TbTextWrapDisabled } from 'react-icons/tb'

export function LineWrapButton(props: {
  codeMirror: EditorView
  lineWrapCompartMent: Compartment
  defaultValue: boolean
  onChange: (value: boolean) => void
}): JSX.Element {
  const [isWrapping, setIsWrapping] = useState(props.defaultValue)
  const { codeMirror, lineWrapCompartMent, onChange } = props
  const toggle = (): void => {
    if (isWrapping) {
      codeMirror.dispatch({
        effects: lineWrapCompartMent.reconfigure([])
      })
    } else {
      codeMirror.dispatch({
        effects: lineWrapCompartMent.reconfigure(EditorView.lineWrapping)
      })
    }
    setIsWrapping(!isWrapping)
  }

  useEffect(() => {
    onChange(isWrapping)
  }, [isWrapping])
  return (
    <>
      <button onClick={(): void => toggle()} className="code-tool-button">
        {isWrapping ? <TbTextWrap /> : <TbTextWrapDisabled />}
      </button>
    </>
  )
}
