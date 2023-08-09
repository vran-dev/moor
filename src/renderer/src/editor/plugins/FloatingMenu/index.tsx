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
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  DEPRECATED_$isGridSelection,
  ElementNode,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
  TextNode
} from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { getDOMRangeRect } from '../../utils/getDOMRangeRect'
import { getSelectedNode } from '../../utils/getSelectedNode'
import { setFloatingElemPosition } from '../../utils/setFloatingElemPosition'
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
import { $patchStyleText, $setBlocksType } from '@lexical/selection'
import { toggleBlockquote } from '@renderer/editor/utils/toggleBlockquote'
import { FloatingLinkEditor } from './floatingLinkEditor'
import tippy from 'tippy.js'
export interface FloatMenu {
  icon: React.ReactNode
  name: string
  description: string
  isActive: (editor: LexicalEditor) => boolean
  onClick: (editor: LexicalEditor) => void
}

function TextFormatFloatingToolbar({
  editor,
  anchorElem
}: {
  editor: LexicalEditor
  anchorElem: HTMLElement
}): JSX.Element {
  const popupCharStylesEditorRef = useRef<HTMLDivElement | null>(null)
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
        // editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        editor.update(() => {
          const selection = $getSelection()
          const colors = ['red', 'blue']
          if ($isRangeSelection(selection)) {
            $patchStyleText(selection, {
              'background-color': colors[Math.floor(Math.random() * colors.length)]
            })
            $patchStyleText(selection, {
              color: 'white'
            })
          }
        })
      },
      isActive: (editor: LexicalEditor): boolean => {
        // TODO
        const nodeStyle: string | null = editor.getEditorState().read<string>(() => {
          if (editor.isComposing()) {
            return false
          }
          const selection = $getSelection()
          const nativeSelection = window.getSelection()
          const rootElement = editor.getRootElement()
          if (nativeSelection !== null) {
            if (!$isRangeSelection(selection)) {
              return null
            }
            if (rootElement === null) {
              return null
            }
            if (!rootElement.contains(nativeSelection.anchorNode)) {
              return null
            }
          }
          const rangeSelection = selection as RangeSelection
          const index = rangeSelection
            .getNodes()
            .findIndex((n) => n instanceof TextNode && n instanceof ElementNode)
          if (index != -1) {
            return false
          }
          const bgColors = rangeSelection
            .getNodes()
            .map((n) => {
              if (n instanceof TextNode) {
                return n.getStyle() ? n.getStyle() : ''
              }
              return ''
            })
            .map((style) => {
              if (style.includes('background-color')) {
                const bg = style.split(';').find((pair) => pair.includes('background-color'))
                return bg?.split(':')[1].trim()
              } else {
                return ''
              }
            })
          console.log(bgColors)
          return bgColors.length == 1
        })
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
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
      },
      isActive: (editor: LexicalEditor): boolean => {
        return hasFormatAtSelection(editor, FormatType.Link)
      }
    }
  ]

  // const insertLink = useCallback(() => {
  //   if (!isLink) {
  //     editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
  //   } else {
  //     editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
  //   }
  // }, [editor, isLink])

  const [tippyInstance, setTippyInstance] = useState(null)

  useEffect(() => {
    if (popupCharStylesEditorRef?.current) {
      const tippyInstance = tippy('body', {
        appendTo: () => document.body,
        trigger: 'manual',
        placement: 'top',
        interactive: true,
        theme: 'light',
        showOnCreate: false,
        getReferenceClientRect: null,
        allowHTML: true,
        maxWidth: 400
      })[0]
      setTippyInstance(tippyInstance)

      return () => {
        tippyInstance.destroy()
      }
    }
  }, [popupCharStylesEditorRef])

  const updateTextFormatFloatingToolbar = useCallback(() => {
    const selection = $getSelection()

    const popupCharStylesEditorElem = popupCharStylesEditorRef.current
    const nativeSelection = window.getSelection()

    if (popupCharStylesEditorElem === null) {
      return
    }

    const rootElement = editor.getRootElement()
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      // do nothing
      if (tippyInstance) {
        tippyInstance.setProps({
          getReferenceClientRect: () => {
            const ns = window.getSelection()
            return getDOMRangeRect(ns, rootElement)
          },
          appendTo: () => document.body,
          trigger: 'manual',
          placement: 'top',
          interactive: true,
          content: popupCharStylesEditorRef.current,
          theme: 'light',
          showOnCreate: false,
          allowHTML: true,
          maxWidth: 400
        })
        // tippyInstance.show()
        console.log('update tippy ', tippy)
      }
      // setFloatingElemPosition(rangeRect, popupCharStylesEditorElem, anchorElem)
    }
  }, [editor, anchorElem])

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateTextFormatFloatingToolbar()
    })
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateTextFormatFloatingToolbar()
        })
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateTextFormatFloatingToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, updateTextFormatFloatingToolbar])

  return (
    <div ref={popupCharStylesEditorRef} className="floating-menu-container">
      {editor.isEditable() &&
        defaultFloatMenus.map((item, index) => (
          <button
            key={item.name}
            onClick={(): void => item.onClick(editor)}
            className={`floating-menu ${item.isActive(editor) ? 'active' : ''}`}
          >
            {item.icon ? item.icon : item.name}
          </button>
        ))}
      {editor.isEditable() && <FloatingLinkEditor editor={editor} />}
    </div>
  )
}

function useFloatingTextFormatToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement
): JSX.Element | null {
  const [isText, setIsText] = useState(false)
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
        setIsText(false)
        return
      }

      if (!$isRangeSelection(selection)) {
        return
      }

      const node = getSelectedNode(selection)
      if (!$isCodeHighlightNode(selection.anchor.getNode()) && selection.getTextContent() !== '') {
        setIsText($isTextNode(node))
      } else {
        setIsText(false)
      }

      const rawTextContent = selection.getTextContent().replace(/\n/g, '')
      if (!selection.isCollapsed() && rawTextContent === '') {
        setIsText(false)
      }
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
          setIsText(false)
        }
      })
    )
  }, [editor, updatePopup])

  if (!isText) {
    return null
  }
  return <TextFormatFloatingToolbar editor={editor} anchorElem={anchorElem} />
}

export default function FloatingTextFormatToolbarPlugin({
  anchorElem = document.body
}: {
  anchorElem?: HTMLElement
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  return useFloatingTextFormatToolbar(editor, anchorElem)
}
