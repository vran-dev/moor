import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import './index.css'
import { useEffect, useRef, useState } from 'react'
import { NodeKey } from 'lexical'

export default function IFramePlaceholder(props: {
  nodeKey: NodeKey
  onSave: (data: string) => void
  onDelete?: () => void
  defaultData?: string
}): JSX.Element {
  const [selected, setSelected, clearSelection] = useLexicalNodeSelection(props.nodeKey)
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const [editable, setEditable] = useState(false)
  const { onSave, defaultData } = props
  useEffect(() => {
    if (editable) {
      textAreaRef.current?.focus()
    }
  }, [editable])

  const saveData = (): void => {
    if (textAreaRef.current) {
      setEditable(false)
      onSave(textAreaRef.current.value)
    }
  }

  const onTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      e.stopPropagation()
      e.target && (e.target as HTMLTextAreaElement).select()
      return
    }
    console.log(e.key)
    if (e.key === 'Backspace') {
      if (textAreaRef.current && textAreaRef.current.value === '' && props.onDelete) {
        e.stopPropagation()
        e.preventDefault()
        props.onDelete()
      }
      return
    }
  }

  useEffect(() => {
    if (selected && textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }, [selected])
  return (
    <div className={`iframe-placeholder`} onClick={(): void => setEditable(true)}>
      <div className="iframe-placeholder-content">
        <div>
          <textarea
            ref={textAreaRef}
            defaultValue={defaultData ? defaultData : ''}
            placeholder="embed <iframe> tag or url"
            onKeyDown={(e): void => onTextAreaKeyDown(e)}
          />
          <button className="iframe-placeholder-save-button" onClick={(): void => saveData()}>
            save
          </button>
        </div>
      </div>
    </div>
  )
}
