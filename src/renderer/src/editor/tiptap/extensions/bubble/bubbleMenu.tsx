/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Editor, BubbleMenu as TiptapBubbleMenu, isActive, useEditor } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { ColorSelector } from './colorSelector'
import '@renderer/assets/bubble-menu.css'
import { LinkBubbleMenu } from './linkBubbleMenu'
interface BubbleMenuItem {
  icon?: ({ className, width, height }) => JSX.Element
  name: string
  symbol: string
  onclick: () => boolean | undefined
  isActive: () => boolean | undefined
}
import { LinkInput } from './linkInput'
import { FocusSelectionPluginKey } from '../../../prosemirror/plugin/linkInputSelectionPlugin'
import { Selection, Transaction } from 'prosemirror-state'
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

export interface BubbleColorMenuItem {
  name: string
  color: string
}

export const BubbleMenu = (props: { editor: Editor | null }): JSX.Element => {
  const editor = props.editor
  const [isEditable, setIsEditable] = useState(true)
  const [tippy, setTippy] = useState(null)
  const [showColorSelector, setShowColorSelector] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)

  const tableMenus: BubbleMenuItem[] = [
    {
      icon: () => <AiOutlineAlignLeft />,
      name: 'Align Left',
      symbol: 'align left',
      onclick: (): boolean | undefined =>
        editor?.chain().focus().setCellAttribute('align', 'left').run(),
      isActive: () => editorIsActive('bold')
    },
    {
      icon: () => <AiOutlineAlignCenter />,
      name: 'Align Center',
      symbol: 'Align Center',
      onclick: (): boolean | undefined =>
        editor?.chain().focus().setCellAttribute('align', 'center').run(),
      isActive: () => editorIsActive('bold')
    },
    {
      icon: () => <AiOutlineAlignRight />,
      name: 'Align Right',
      symbol: 'align right',
      onclick: (): boolean | undefined =>
        editor?.chain().focus().setCellAttribute('align', 'right').run(),
      isActive: () => editorIsActive('bold')
    }
  ]

  const commonMenus: BubbleMenuItem[] = [
    {
      icon: () => <AiOutlineBold />,
      name: 'B',
      symbol: 'bold',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleBold().run(),
      isActive: () => editorIsActive('bold')
    },
    {
      icon: () => <AiOutlineItalic />,
      name: 'Italic',
      symbol: 'italic',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editorIsActive('italic')
    },
    {
      icon: () => <AiOutlineStrikethrough />,
      name: 'Strikethrough',
      symbol: 'strike',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleStrike().run(),
      isActive: () => editorIsActive('strike')
    },
    {
      icon: () => <AiOutlineUnderline />,
      name: 'Underline',
      symbol: 'underline',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleUnderline().run(),
      isActive: () => editorIsActive('underline')
    },
    {
      icon: () => <LiaQuoteLeftSolid />,
      name: 'Blockquote',
      symbol: 'blockquote',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleBlockquote().run(),
      isActive: () => editorIsActive('blockquote')
    },
    {
      icon: () => <FiCode />,
      name: 'Code',
      symbol: 'code',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleCode().run(),
      isActive: () => editorIsActive('code')
    },
    {
      name: 'A',
      symbol: '',
      icon: () => <AiOutlineBgColors />,
      onclick: (): boolean | undefined => {
        setShowColorSelector(!showColorSelector)
        return true
      },
      isActive: () => showColorSelector || editorIsActive('highlight')
    }
  ]

  const menuItems = editor?.isActive('table') ? [...tableMenus, ...commonMenus] : [...commonMenus]

  const editorIsActive = (name: string): boolean => {
    return editor?.isActive(name)
  }

  useEffect(() => {
    if (tippy && tippy.popperInstance) {
      tippy.popperInstance.update()
    }
  }, [showColorSelector, showLinkInput, tippy])

  const onLinkInputFocus = (): void => {
    const tr: Transaction = editor.view.state.tr.setMeta(FocusSelectionPluginKey, {
      visible: showLinkInput
    })
    editor?.view.dispatch(tr)
  }

  const onLinkInputBlur = (): void => {
    tippy?.hide()
  }
  useEffect(() => {
    if (showLinkInput) {
      onLinkInputFocus()
    }
  }, [showLinkInput])

  const bubbleMenuProps = {
    ...props,
    shouldShow: ({ editor }): boolean => {
      if (editor.isActive('image')) {
        return false
      }
      if (editor.isActive('excalidraw')) {
        return false
      }
      if (editor.isActive('codeBlock')) {
        return false
      }
      if (!editor.view.state.selection) {
        return false
      }

      if (editor.view.state.selection.node) {
        return false
      }
      return editor.view.state.selection.content().size > 0
    },
    tippyOptions: {
      moveTransition: 'transform 0.15s ease-out',
      appendTo: () => editor?.view.dom.parentNode,
      maxWidth: '460px',
      onShow(instance) {
        setTippy(instance)
        return true
      },
      onHide() {
        setShowColorSelector(false)
        setShowLinkInput(false)
        return true
      }
    }
  }

  const onLinkClick = () => {
    setShowLinkInput(!showLinkInput)
  }

  return (
    <>
      {editor && (
        <>
          <TiptapBubbleMenu
            className="bubble-menu"
            {...bubbleMenuProps}
            onChange={(): void => setIsEditable(!isEditable)}
          >
            {showColorSelector && <ColorSelector editor={editor} className="bubble-menu-row" />}
            <div className="bubble-menu-row bubble-menu-bg">
              {menuItems.map((item, index) => (
                <button
                  key={item.name}
                  onClick={item.onclick}
                  className={`bubble-menu-item ${item.isActive() ? 'active' : ''}`}
                >
                  {item.icon
                    ? item.icon({
                        className: 'icon',
                        width: 14,
                        height: 14
                      })
                    : item.name}
                </button>
              ))}

              <LinkBubbleMenu
                editor={editor}
                onClick={(e) => onLinkClick()}
                isActive={showLinkInput || editorIsActive('link')}
              />
            </div>
            {showLinkInput && (
              <LinkInput
                editor={editor}
                onInputFocus={() => onLinkInputFocus()}
                onInputBlur={() => onLinkInputBlur()}
              />
            )}
          </TiptapBubbleMenu>
        </>
      )}
    </>
  )
}
