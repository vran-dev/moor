import { BsImage } from 'react-icons/bs'
import './index.css'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@renderer/ui/Button'
import { $getNodeByKey, NodeKey } from 'lexical'
import { useDebounce } from '@renderer/editor/utils/useDebounce'
import { $isImageNode, ImageNode } from '../..'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { AiOutlineWarning } from 'react-icons/ai'
import useShortcut from '@renderer/editor/utils/useShortcut'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'

export function ImageUploader(props: { nodeKey: NodeKey }): JSX.Element {
  const [editing, setEditing] = useState<boolean>(false)
  const [dragging, setDragging] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const imageUploaderContainerRef = useRef<HTMLDivElement>(null)
  const [errMessage, setErrMessage] = useState<string | null>(null)
  const [selected, setSelected, clearSelection] = useLexicalNodeSelection(props.nodeKey)
  const [editor] = useLexicalComposerContext()
  const { nodeKey } = props
  const withImageNode = useDebounce(
    (callback: (node: ImageNode) => void, onUpdate?: () => void): void => {
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey)
          if ($isImageNode(node)) {
            callback(node)
          }
        },
        { onUpdate }
      )
    },
    50,
    1000
  )

  useEffect(() => {
    if (editing && inputRef.current) {
      setErrMessage(null)
      inputRef.current.focus()
    }
  }, [editing])

  const turnOffEditingIfClickOutside = useCallback(
    (e: FocusEvent) => {
      const targetEle = e.target as HTMLElement
      if (targetEle && targetEle.closest('.image-uploader-container') === null) {
        // save data
        if (inputRef.current && inputRef.current.value !== '') {
          const src = inputRef.current.value
          withImageNode((node: ImageNode) => {
            node.setSrc(src)
          })
        }
        setEditing(false)
      }
    },
    [editing, imageUploaderContainerRef]
  )

  useEffect(() => {
    if (editing && imageUploaderContainerRef.current) {
      document.addEventListener('mousedown', turnOffEditingIfClickOutside)
      return () => {
        document.removeEventListener('mousedown', turnOffEditingIfClickOutside)
      }
    }
  }, [editing])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.dataTransfer) {
      return
    }
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      // TODO should add loading and customize file upload handler
      reader.onload = function (): void {
        const src = reader.result
        withImageNode((node: ImageNode) => {
          node.setSrc(src as string)
          setEditing(false)
        })
      }
      reader.onerror = function (): void {
        setErrMessage('Failed to load image')
        setEditing(false)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  useShortcut(inputRef, {
    a: (e: KeyboardEvent) => {
      if (!inputRef.current) {
        return
      }
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        e.stopPropagation()
        inputRef.current.select()
      }
    },
    Backspace: (e: KeyboardEvent) => {
      setSelected(false)
      if (inputRef.current && inputRef.current.value === '') {
        withImageNode((node: ImageNode) => {
          node.selectPrevious()
          node.remove()
        })
      }
    }
  })

  return (
    <div
      className={`image-uploader-container ${dragging ? 'dragging' : ''} ${
        editing ? 'editing' : ''
      }`}
      onClick={(e): void => {
        if (!editing) {
          setEditing(true)
        }
      }}
      ref={imageUploaderContainerRef}
      onBlur={(e): void => turnOffEditingIfClickOutside(e)}
      onDrop={(e): void => handleDrop(e)}
      onDragEnter={(e): void => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e): void => {
        e.preventDefault()
        setDragging(false)
      }}
    >
      <span
        className="image-uploader-icon"
        style={{
          pointerEvents: dragging ? 'none' : 'auto'
        }}
      >
        {errMessage && !editing ? <AiOutlineWarning size={24} /> : <BsImage size={26}></BsImage>}
      </span>
      <div
        className="image-uploader-form"
        style={{
          pointerEvents: dragging ? 'none' : 'auto'
        }}
      >
        <Placeholder errMessage={errMessage} isEditing={editing} />
        {editing && (
          <>
            <input type="url" ref={inputRef} />
            <Button
              type="text"
              onClick={(e): void => {
                withImageNode((node: ImageNode) => {
                  if (inputRef.current && inputRef.current.value !== '') {
                    node.setSrc(inputRef.current.value)
                    setEditing(false)
                  }
                })
              }}
            >
              save
            </Button>
            <Button
              type="text"
              onClick={(e): void => {
                setEditing(false)
              }}
            >
              cancel
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function Placeholder(props: { errMessage?: string | null; isEditing: boolean }): ReactNode {
  const { errMessage, isEditing } = props
  if (isEditing) {
    return null
  }

  // if has error message, show error message
  if (props.errMessage) {
    return <div className="image-uploader-error">{errMessage}</div>
  }

  const onChooseFile = (e): void => {
    e.stopPropagation()
    e.preventDefault()
    // TODO
  }
  // if no error message, show placeholder
  return (
    <>
      <span className="image-editor-placeholder">
        Paste url or{' '}
        <button
          onClick={(e): void => {
            onChooseFile(e)
          }}
        >
          Upload a picture
        </button>
      </span>
    </>
  )
}
