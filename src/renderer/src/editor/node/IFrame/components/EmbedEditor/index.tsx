import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import './index.css'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { $getSelection, $isNodeSelection, NodeKey, NodeSelection } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Button } from '@renderer/ui/Button'
import { BsWindow } from 'react-icons/bs'
import useShortcut from '@renderer/editor/utils/useShortcut'

const hasString = (str: string | null | undefined): boolean => {
  return str !== null && str !== undefined && str !== ''
}

export default function EmbedEditor(props: {
  nodeKey: NodeKey
  onSave: (data: string) => void
  onEditCancel?: () => void
  onDelete?: () => void
  defaultData?: string
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [selected, setSelected, clearSelection] = useLexicalNodeSelection(props.nodeKey)
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const iframeEditorContainerRef = useRef<HTMLDivElement>(null)
  const [editing, setEditing] = useState(hasString(props.defaultData))
  const { onSave, defaultData } = props
  useEffect(() => {
    if (editing) {
      textAreaRef.current?.focus()
    }
  }, [editing])

  const saveData = (): void => {
    if (textAreaRef.current) {
      setEditing(false)
      onSave(textAreaRef.current.value)
    }
  }
  useShortcut(textAreaRef, {
    a: (e: KeyboardEvent) => {
      if (!textAreaRef.current) {
        return
      }
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        e.stopPropagation()
        textAreaRef.current.select()
      }
    },
    Backspace: (e: KeyboardEvent) => {
      setSelected(false)
      if (textAreaRef.current && textAreaRef.current.value === '' && props.onDelete) {
        props.onDelete()
      }
    }
  })

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

  const turnOffEditingIfClickOutside = useCallback(
    (e: FocusEvent) => {
      const targetEle = e.target as HTMLElement
      if (targetEle && targetEle.closest('.iframe-editor') === null) {
        setEditing(false)
      }
    },
    [editing, iframeEditorContainerRef]
  )
  return (
    <div
      className={`iframe-editor ${editing ? 'editing' : ''}`}
      onClick={(): void => setEditing(true)}
      onBlur={(e): void => turnOffEditingIfClickOutside(e)}
      ref={iframeEditorContainerRef}
    >
      <span className="iframe-editor-icon">
        <BsWindow size={30} />
      </span>
      <div className="iframe-editor-main">
        {!editing && <Placeholder isEditing={editing} />}
        {editing && (
          <div className="iframe-editor-form">
            <textarea
              ref={textAreaRef}
              defaultValue={defaultData ? defaultData : ''}
              placeholder="embed <iframe> tag or url"
            />
            <Button onClick={(): void => saveData()}>save</Button>
            <Button
              onClick={(e): void => {
                e.preventDefault()
                e.stopPropagation()
                setEditing(false)
                props.onEditCancel?.()
              }}
            >
              cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Placeholder(props: { isEditing: boolean }): ReactNode {
  const { isEditing } = props
  if (isEditing) {
    return null
  }

  const onChooseFile = (e): void => {
    e.stopPropagation()
    e.preventDefault()
    // TODO
  }
  // if no error message, show placeholder
  return (
    <>
      <span className="image-uploader-text">
        click to embed url /{' '}
        <button
          onClick={(e): void => {
            onChooseFile(e)
          }}
        >
          or Choose a file [TD]
        </button>{' '}
      </span>
    </>
  )
}
