/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND
} from 'lexical'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { OPEN_LINK_EDITOR } from './openLinkEditorCommand'
import { getSelectedNode } from '@renderer/editor/utils/getSelectedNode'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import '../FloatingMenu/index.css'
import { mergeRegister } from '@lexical/utils'
import {
  useFloating,
  offset,
  flip,
  shift,
  inline,
  autoUpdate,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager
} from '@floating-ui/react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { getDOMRangeClientRect, getDOMRangeRect } from '@renderer/editor/utils/getDOMRangeRect'
import { AiOutlineLink } from 'react-icons/ai'
import { sanitizeUrl } from '@renderer/editor/utils/url'
import { usePreudoSelection } from '../UsePseudoSelection'
import { createDOMRange, createRectsFromDOMRange } from '@lexical/selection'
import { $isMarkNode } from '@lexical/mark'

export const FloatingLinkEditor = (props: {
  editor: LexicalEditor
  onSave?: (input) => void
  onReset?: () => void
  onInputFocus?: () => void
  onInputBlur?: () => void
}): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [activeEditor, setActiveEditor] = useState<LexicalEditor | null>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { editor } = props
  useEffect(() => {
    inputRef.current && inputRef.current?.focus()
  }, [])

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom',
    open: isOpen,
    onOpenChange: (open, event) => {
      setIsOpen(open)
    },
    middleware: [offset(6), flip(), shift(), inline()],
    whileElementsMounted: autoUpdate
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'dialog' })
  const { getFloatingProps } = useInteractions([dismiss, role])
  const [preudoSelectionUpdate, preudoSelectionReset] = usePreudoSelection(editor)

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const nativeSelection = window.getSelection()
      const rootElement = editor.getRootElement()
      if (
        nativeSelection !== null &&
        (rootElement === null || !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsOpen(false)
        return
      }
      const rawTextContent = selection.getTextContent().replace(/\n/g, '')
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsOpen(false)
        return
      }

      if ($isRangeSelection(selection)) {
        const node = getSelectedNode(selection)
        const parent = node.getParent()
        if ($isLinkNode(parent)) {
          setLinkUrl(parent.getURL())
        } else if ($isLinkNode(node)) {
          setLinkUrl(node.getURL())
        } else {
          setLinkUrl('')
        }
      }

      setIsOpen(true)
      if (
        selection !== null &&
        nativeSelection !== null &&
        rootElement !== null &&
        rootElement.contains(nativeSelection.anchorNode) &&
        editor.isEditable()
      ) {
        refs.setReference({
          getBoundingClientRect: () => getDOMRangeRect(nativeSelection, rootElement),
          getClientRects: () => getDOMRangeClientRect(nativeSelection, rootElement)
        })
      }
    }
  }, [editor])

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        OPEN_LINK_EDITOR,
        (_payload, newEditor) => {
          updateLinkEditor()
          setActiveEditor(newEditor)
          return false
        },
        COMMAND_PRIORITY_CRITICAL
      )
    )
  }, [editor, updateLinkEditor])

  useEffect(() => {
    if (isOpen) {
      preudoSelectionUpdate()
    } else {
      preudoSelectionReset()
    }
  }, [isOpen])

  const onSetLink = (e) => {
    const value = inputRef.current?.value || ''
    if (value !== '') {
      const standardUrl = sanitizeUrl(value)
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url: standardUrl })
      props.onSave?.(value)
      setIsOpen(false)
    }
  }

  const onRestLink = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        return
      }
      const nodes = selection?.getNodes()
      setIsOpen(false)
      props.onReset?.()
    })
  }

  return (
    <>
      {isOpen && (
        <FloatingFocusManager context={context}>
          <div
            ref={refs.setFloating}
            className="floating-menu-container"
            style={{ ...floatingStyles }}
            {...getFloatingProps()}
          >
            <div className={'floating-menu-list'}>
              <div className="floating-menu-group">
                <AiOutlineLink style={{ marginLeft: '8px' }} />
                <input
                  className={'floating-input'}
                  ref={inputRef}
                  type="text"
                  placeholder="Type or paste URL"
                  spellCheck={false}
                  onFocus={() => props.onInputFocus?.()}
                  defaultValue={linkUrl}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      onSetLink(e)
                    }
                  }}
                />

                <button className={'floating-menu'} onClick={(e) => onSetLink(e)}>
                  save
                </button>
                {/* <button className={'floating-menu'} onClick={(e) => onRestLink()}>
                  reset
                </button> */}
              </div>
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  )
}

export default function FloatingLinkEditorPlugin() {
  const [editor] = useLexicalComposerContext()
  return <FloatingLinkEditor editor={editor} />
}
