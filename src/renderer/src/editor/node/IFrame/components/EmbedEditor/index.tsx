import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import './index.css'
import { useEffect, useRef, useState } from 'react'
import { $getSelection, $isNodeSelection, NodeKey, NodeSelection } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

export default function EmbedEditor(props: {
  nodeKey: NodeKey
  onSave: (data: string) => void
  onDelete?: () => void
  defaultData?: string
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
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
      console.log(e.target)
      e.target && (e.target as HTMLTextAreaElement).select()
      return
    }
    if (e.key === 'Backspace') {
      setSelected(false)
      if (textAreaRef.current && textAreaRef.current.value === '' && props.onDelete) {
        props.onDelete()
      }
    }
  }

  useEffect(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection
      if ($isNodeSelection(selection)) {
        const nodeSelection = selection as NodeSelection
        const selectedNodes = nodeSelection.getNodes()
        if (selectedNodes.length == 1 && selected && textAreaRef.current) {
          textAreaRef.current.focus()
        }
      }
    })
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
