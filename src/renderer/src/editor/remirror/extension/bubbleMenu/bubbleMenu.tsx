/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useRef, useState } from 'react'
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
// import { LinkInputSelectionPluginKey } from '../link/linkInputSelectionPlugin'
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
import { FloatingToolbar, useActive, useCommands, useEditorView } from '@remirror/react'
import {
  BlockquoteExtension,
  BoldExtension,
  CodeExtension,
  ItalicExtension,
  StrikeExtension,
  TextHighlightExtension,
  UnderlineExtension
} from 'remirror/extensions'
import { FocusSelectionPluginKey } from '@renderer/editor/prosemirror/plugin/linkInputSelectionPlugin'

export interface BubbleColorMenuItem {
  name: string
  color: string
}

export const BubbleMenu = (props): JSX.Element => {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [showColorSelector, setShowColorSelector] = useState(false)
  const popperRef = useRef(null)

  const {
    toggleBold,
    toggleItalic,
    toggleStrike,
    toggleUnderline,
    toggleBlockquote,
    toggleCode,
    focus
  } = useCommands()

  useEffect(() => {
    return () => {
      console.log('unmounting')
    }
  }, [])

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
      onclick: (): void => {
        toggleBold()
        focus()
      },
      isActive: () => useActive<BoldExtension>().bold()
    },
    {
      icon: () => <AiOutlineItalic />,
      name: 'Italic',
      symbol: 'italic',
      onclick: (): boolean | undefined => {
        toggleItalic()
        focus()
      },
      isActive: () => useActive<ItalicExtension>().italic()
    },
    {
      icon: () => <AiOutlineStrikethrough />,
      name: 'Strikethrough',
      symbol: 'strike',
      onclick: (): boolean | undefined => {
        toggleStrike()
        focus()
      },
      isActive: () => useActive<StrikeExtension>().strike()
    },
    {
      icon: () => <AiOutlineUnderline />,
      name: 'Underline',
      symbol: 'underline',
      onclick: (): boolean | undefined => {
        toggleUnderline()
        focus()
      },
      isActive: () => useActive<UnderlineExtension>().underline()
    },
    {
      icon: () => <LiaQuoteLeftSolid />,
      name: 'Blockquote',
      symbol: 'blockquote',
      onclick: (): boolean | undefined => {
        toggleBlockquote()
        focus()
      },
      isActive: () => useActive<BlockquoteExtension>().blockquote()
    },
    {
      icon: () => <FiCode />,
      name: 'Code',
      symbol: 'code',
      onclick: (): boolean | undefined => {
        toggleCode()
        focus()
      },
      isActive: () => useActive<CodeExtension>().code()
    },
    {
      name: 'A',
      symbol: '',
      icon: () => <AiOutlineBgColors />,
      onclick: (): boolean | undefined => {
        setShowColorSelector(!showColorSelector)
      },
      isActive: () => {
        const isTextHighlight = useActive<TextHighlightExtension>().textHighlight()
        return showColorSelector || isTextHighlight
      }
    }
  ]

  const view = useEditorView()
  const onLinkInputFocus = (): void => {
    const tr = view.state.tr.setMeta(FocusSelectionPluginKey, {
      visible: showLinkInput
    })
    view.dispatch(tr)
  }

  const onLinkInputBlur = (): void => {
    if (popperRef) {
      popperRef.current?.state.modifiersData.hide()
    }
  }
  // const menuItems = editor?.isActive('table') ? [...tableMenus, ...commonMenus] : [...commonMenus]

  const menuItems = [...commonMenus]

  const onLinkClick = () => {
    setShowLinkInput(!showLinkInput)
  }

  const onPoperUpdate = (data) => {
    console.log(data)
  }
  return (
    <>
      <FloatingToolbar popperOptions={{ onFirstUpdate: onPoperUpdate }} popperRef={popperRef}>
        <div className="bubble-menu">
          {showColorSelector && <ColorSelector className="bubble-menu-row" />}
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

            <LinkBubbleMenu onClick={(e) => onLinkClick()} isActive={showLinkInput} />
          </div>
          {showLinkInput && (
            <LinkInput
              onInputFocus={() => onLinkInputFocus()}
              onInputBlur={() => onLinkInputBlur()}
            />
          )}
        </div>
      </FloatingToolbar>
    </>
  )
}
