/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useEffect, useRef, useState } from 'react'
import { ColorSelector } from './FloatingColorSelector'
// import '@renderer/assets/bubble-menu.css'
import { LinkBubbleMenu } from './linkBubbleMenu'
import './index.css'
interface BubbleMenuItem {
  icon?: ({ className, width, height }) => JSX.Element
  name: string
  symbol: string
  onClick: () => boolean | undefined
  isActive: () => boolean | undefined
}
import { FloatingLinkEditor } from './FloatingLinkEditor'
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
  LinkExtension,
  StrikeExtension,
  TextHighlightExtension,
  UnderlineExtension
} from 'remirror/extensions'
import { FocusSelectionPluginKey } from '@renderer/editor/prosemirror/plugin/linkInputSelectionPlugin'

export interface FloatingMenuItem {
  name: string
  color: string
  icon: ({ className, width, height }) => JSX.Element
  onClick: () => void
  isActive: () => boolean
}

export const FloatingMenu = (props): JSX.Element => {
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

  const tableMenus: FloatingMenuItem[] = [
    {
      icon: () => <AiOutlineAlignLeft />,
      name: 'Align Left',
      symbol: 'align left',
      onClick: (): boolean | undefined =>
        editor?.chain().focus().setCellAttribute('align', 'left').run(),
      isActive: () => editorIsActive('bold')
    },
    {
      icon: () => <AiOutlineAlignCenter />,
      name: 'Align Center',
      symbol: 'Align Center',
      onClick: (): boolean | undefined =>
        editor?.chain().focus().setCellAttribute('align', 'center').run(),
      isActive: () => editorIsActive('bold')
    },
    {
      icon: () => <AiOutlineAlignRight />,
      name: 'Align Right',
      symbol: 'align right',
      onClick: (): boolean | undefined =>
        editor?.chain().focus().setCellAttribute('align', 'right').run(),
      isActive: () => editorIsActive('bold')
    }
  ]

  const commonMenus: FloatingMenuItem[] = [
    {
      icon: () => <AiOutlineBold />,
      name: 'B',
      symbol: 'bold',
      onClick: (): void => {
        toggleBold()
        focus()
      },
      isActive: () => useActive<BoldExtension>().bold()
    },
    {
      icon: () => <AiOutlineItalic />,
      name: 'Italic',
      symbol: 'italic',
      onClick: (): boolean | undefined => {
        toggleItalic()
        focus()
      },
      isActive: () => useActive<ItalicExtension>().italic()
    },
    {
      icon: () => <AiOutlineStrikethrough />,
      name: 'Strikethrough',
      symbol: 'strike',
      onClick: (): boolean | undefined => {
        toggleStrike()
        focus()
      },
      isActive: () => useActive<StrikeExtension>().strike()
    },
    {
      icon: () => <AiOutlineUnderline />,
      name: 'Underline',
      symbol: 'underline',
      onClick: (): boolean | undefined => {
        toggleUnderline()
        focus()
      },
      isActive: () => useActive<UnderlineExtension>().underline()
    },
    {
      icon: () => <LiaQuoteLeftSolid />,
      name: 'Blockquote',
      symbol: 'blockquote',
      onClick: (): boolean | undefined => {
        toggleBlockquote()
        focus()
      },
      isActive: () => useActive<BlockquoteExtension>().blockquote()
    },
    {
      icon: () => <FiCode />,
      name: 'Code',
      symbol: 'code',
      onClick: (): boolean | undefined => {
        toggleCode()
        focus()
      },
      isActive: () => useActive<CodeExtension>().code()
    },
    {
      name: 'A',
      symbol: '',
      icon: () => <AiOutlineBgColors />,
      onClick: (): boolean | undefined => {
        setShowColorSelector(!showColorSelector)
      },
      isActive: () => {
        const isTextHighlight = useActive<TextHighlightExtension>().textHighlight()
        return showColorSelector || isTextHighlight
      }
    },
    {
      name: 'Link',
      symbol: '',
      icon: () => (
        <>
          <div>↗</div>
          <div>Link</div>
        </>
      ),
      onClick: (): boolean | undefined => {
        setShowLinkInput(!showLinkInput)
      },
      isActive: () => {
        const isLink = useActive<LinkExtension>().link()
        return showLinkInput || isLink
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
      setShowLinkInput(false)
      popperRef.current?.state.modifiersData.hide()
    }
  }
  // const menuItems = editor?.isActive('table') ? [...tableMenus, ...commonMenus] : [...commonMenus]

  const menuItems = [...commonMenus]

  const onPoperUpdate = (data) => {
    console.log(data)
  }
  return (
    <>
      <FloatingToolbar
        popperOptions={{ onFirstUpdate: onPoperUpdate }}
        popperRef={popperRef}
        className="z-top"
      >
        <div className="floating-menu-container">
          {showColorSelector && <ColorSelector className="floating-menu-group" />}
          <div className="floating-menu-group">
            {menuItems.map((item, index) => (
              <button
                key={item.name}
                onClick={item.onClick}
                className={`floating-menu ${item.isActive() ? 'active' : ''}`}
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
          </div>
          {showLinkInput && (
            <FloatingLinkEditor
              onInputFocus={() => onLinkInputFocus()}
              onInputBlur={() => onLinkInputBlur()}
            />
          )}
        </div>
      </FloatingToolbar>
    </>
  )
}
