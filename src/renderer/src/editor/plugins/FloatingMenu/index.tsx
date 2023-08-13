/* eslint-disable @typescript-eslint/explicit-function-return-type */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './index.css'

import { $isCodeHighlightNode } from '@lexical/code'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  SELECTION_CHANGE_COMMAND
} from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as React from 'react'

import { getDOMRangeClientRect, getDOMRangeRect } from '../../utils/getDOMRangeRect'
import { getSelectedNode } from '../../utils/getSelectedNode'
import {
  AiOutlineBgColors,
  AiOutlineBold,
  AiOutlineItalic,
  AiOutlineStrikethrough,
  AiOutlineUnderline,
  AiOutlineAlignRight,
  AiOutlineAlignLeft,
  AiOutlineAlignCenter
} from 'react-icons/ai'
import { LiaQuoteLeftSolid } from 'react-icons/lia'
import { FiCode } from 'react-icons/fi'
import { FormatType, hasFormatAtSelection } from '@renderer/editor/utils/hasFormatAtSelection'
import { toggleBlockquote } from '@renderer/editor/utils/toggleBlockquote'
import { FloatingColorSelector } from './FloatingColorSelector'
import {
  useFloating,
  autoUpdate,
  flip,
  offset,
  shift,
  inline,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal
} from '@floating-ui/react'
import { OPEN_LINK_EDITOR } from '../FloatingLinkEditor/openLinkEditorCommand'
import { $isCodeMirrorNode } from '@renderer/editor/node/CodeMirror'

export interface FloatMenu {
  icon: React.ReactNode
  name: string
  description: string
  isActive: (editor: LexicalEditor) => boolean
  onClick: (editor: LexicalEditor) => void
}

const FloatingMenu = React.forwardRef(
  (
    { editor, style, attrs }: { editor: LexicalEditor; style: object; attrs: any },
    ref: React.Ref<HTMLDivElement>
  ) => {
    const defaultFloatMenus: FloatMenu[] = [
      {
        icon: <AiOutlineBold />,
        name: 'B',
        description: 'bold',
        onClick: (editor: LexicalEditor): void => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        },
        isActive: (editor: LexicalEditor): boolean => {
          return hasFormatAtSelection(editor, FormatType.Bold)
        }
      },
      {
        icon: <AiOutlineItalic />,
        name: 'Italic',
        description: 'italic',
        onClick: (editor: LexicalEditor): void => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
        },
        isActive: (editor: LexicalEditor): boolean => {
          return hasFormatAtSelection(editor, FormatType.Italic)
        }
      },
      {
        icon: <AiOutlineStrikethrough />,
        name: 'Strikethrough',
        description: 'strike',
        onClick: (editor: LexicalEditor): void => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        },
        isActive: (editor: LexicalEditor): boolean => {
          return hasFormatAtSelection(editor, FormatType.Strikethrough)
        }
      },
      {
        icon: <AiOutlineUnderline />,
        name: 'Underline',
        description: 'underline',
        onClick: (editor: LexicalEditor): void => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
        },
        isActive: (editor: LexicalEditor): boolean => {
          return hasFormatAtSelection(editor, FormatType.Underline)
        }
      },
      {
        icon: <LiaQuoteLeftSolid />,
        name: 'Blockquote',
        description: 'blockquote',
        onClick: (editor: LexicalEditor): void => {
          toggleBlockquote(editor)
        },
        isActive: (editor: LexicalEditor): boolean => {
          return hasFormatAtSelection(editor, FormatType.Quote)
        }
      },
      {
        icon: <FiCode />,
        name: 'Code',
        description: 'code',
        onClick: (editor: LexicalEditor): void => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
        },
        isActive: (editor: LexicalEditor): boolean => {
          return hasFormatAtSelection(editor, FormatType.Code)
        }
      },
      {
        name: 'A',
        description: '',
        icon: <AiOutlineBgColors />,
        onClick: (editor: LexicalEditor): void => {
          setShowColorSelector(!showColorSelector)
        },
        isActive: (editor: LexicalEditor): boolean => {
          return false
        }
      },
      {
        icon: (
          <>
            <span>↗</span>
            <span>Link</span>
          </>
        ),
        name: 'Link',
        description: 'Link',
        onClick: (editor: LexicalEditor): void => {
          if (!hasFormatAtSelection(editor, FormatType.Link)) {
            editor.dispatchCommand(OPEN_LINK_EDITOR, 'https://')
          } else {
            editor.dispatchCommand(OPEN_LINK_EDITOR, null)
          }
        },
        isActive: (editor: LexicalEditor): boolean => {
          return hasFormatAtSelection(editor, FormatType.Link)
        }
      }
    ]

    const [showColorSelector, setShowColorSelector] = useState(false)

    return (
      <div ref={ref} className="floating-menu-container" style={style} {...attrs}>
        <div className="floating-menu-list">
          {editor.isEditable() && showColorSelector && <FloatingColorSelector editor={editor} />}
          <div className="floating-menu-group">
            {editor.isEditable() &&
              defaultFloatMenus.map((item, index) => (
                <button
                  key={index}
                  onClick={(): void => item.onClick(editor)}
                  className={`floating-menu ${item.isActive(editor) ? 'active' : ''}`}
                >
                  {item.icon ? item.icon : item.name}
                </button>
              ))}
          </div>
        </div>
      </div>
    )
  }
)
FloatingMenu.displayName = 'FloatingMenu'

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement
): JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    placement: 'top',
    open: isOpen,
    onOpenChange: (open, event) => {
      setIsOpen(open)
    },
    middleware: [offset(10), flip(), shift(), inline()],
    whileElementsMounted: autoUpdate
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })
  const { getFloatingProps } = useInteractions([dismiss, role])

  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return
      }
      const selection = $getSelection()
      const nativeSelection = window.getSelection()
      const rootElement = editor.getRootElement()

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsOpen(false)
        return
      }

      if (!$isRangeSelection(selection)) {
        return
      }

      const node = getSelectedNode(selection)
      if ($isCodeMirrorNode(selection.anchor.getNode())) {
        setIsOpen(false)
      } else if ($isCodeHighlightNode(selection.anchor.getNode())) {
        setIsOpen(false)
      } else if (selection.getTextContent() !== '') {
        setIsOpen($isTextNode(node))
      } else {
        setIsOpen(false)
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '')
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsOpen(false)
      }
      refs.setReference({
        getBoundingClientRect: () => getDOMRangeRect(nativeSelection, rootElement),
        getClientRects: () => getDOMRangeClientRect(nativeSelection, rootElement)
      })
    })
  }, [editor])

  useEffect(() => {
    document.addEventListener('selectionchange', updatePopup)
    return () => {
      document.removeEventListener('selectionchange', updatePopup)
    }
  }, [updatePopup])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup()
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsOpen(false)
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          if (isOpen) {
            updatePopup()
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, updatePopup])

  if (!isOpen) {
    return null
  }

  return (
    <>
      <FloatingPortal>
        {isOpen && (
          <FloatingMenu
            ref={refs.setFloating}
            editor={editor}
            style={{ ...floatingStyles }}
            {...getFloatingProps}
          />
        )}
      </FloatingPortal>
    </>
  )
}

export default function FloatingTextFormatToolbarPlugin({
  anchorElem = document.body
}: {
  anchorElem?: HTMLElement
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  return useFloatingTextFormatToolbar(editor, anchorElem)
}
