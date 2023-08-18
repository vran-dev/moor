import { ImEmbed } from 'react-icons/im'
import './index.css'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function IFramePlaceholder(props: {
  onSave: (data: string) => void
  defaultData?: string
}): JSX.Element {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const [editable, setEditable] = useState(false)
  const { onSave, defaultData } = props
  useEffect(() => {
    if (editable) {
      textAreaRef.current?.focus()
    }
  }, [editable])

  const isEditing = useCallback(() => {
    return editable || defaultData
  }, [defaultData, editable])

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
    }
  }
  return (
    <div
      className={`iframe-placeholder ${isEditing() ? 'editing' : ''}`}
      onClick={(): void => setEditable(true)}
    >
      {!isEditing() && (
        <div className="iframe-placeholder-icon">
          <ImEmbed />
        </div>
      )}

      <div className="iframe-placeholder-content">
        {isEditing() ? (
          <div>
            <textarea
              ref={textAreaRef}
              defaultValue={defaultData ? defaultData : ''}
              placeholder="typing or paste url"
              onKeyDown={(e): void => onTextAreaKeyDown(e)}
            />
            <button className="iframe-placeholder-save-button" onClick={(): void => saveData()}>
              save
            </button>
          </div>
        ) : (
          <p>Click to embed &lt;IFrame&gt; tag or url</p>
        )}
      </div>
    </div>
  )
}
