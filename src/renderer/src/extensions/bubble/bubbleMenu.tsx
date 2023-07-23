import { Editor, BubbleMenu as TiptapBubbleMenu, useEditor } from '@tiptap/react'
import { useState } from 'react'
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  CodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
  QuoteIcon
} from '@renderer/components/Icons'
import { ColorSelector } from './colorSelector'

interface BubbleMenuItem {
  icon: ({ className, width, height }) => JSX.Element
  name: string
  symbol: string
  onclick: () => boolean | undefined
}

export const BubbleMenu = (props: { editor: Editor | null }): JSX.Element => {
  const editor = props.editor
  const [isEditable, setIsEditable] = useState(true)
  const menuItems: BubbleMenuItem[] = [
    {
      icon: BoldIcon,
      name: 'Bold',
      symbol: 'bold',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleBold().run()
    },
    {
      icon: ItalicIcon,
      name: 'Italic',
      symbol: 'italic',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleItalic().run()
    },
    {
      icon: LinkIcon,
      name: 'Link',
      symbol: 'link',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleLink({ href: '' }).run()
    },
    {
      icon: StrikethroughIcon,
      name: 'Strikethrough',
      symbol: 'strike',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleStrike().run()
    },
    {
      icon: UnderlineIcon,
      name: 'Underline',
      symbol: 'underline',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleUnderline().run()
    },
    {
      icon: QuoteIcon,
      name: 'Blockquote',
      symbol: 'blockquote',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleBlockquote().run()
    },
    {
      icon: CodeIcon,
      name: 'Code',
      symbol: 'code',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleCode().run()
    }
  ]
  return (
    <>
      {editor && (
        <TiptapBubbleMenu
          editor={editor}
          onChange={(): void => setIsEditable(!isEditable)}
          className="bubble-menu"
        >
          {menuItems.map((item) => (
            <button key={item.name} onClick={item.onclick} className={'bubble-menu-item'}>
              {item.icon({
                className: editor.isActive(item.symbol) ? 'active' : 'icon',
                width: 14,
                height: 14
              })}
            </button>
          ))}
          <ColorSelector editor={editor} />
        </TiptapBubbleMenu>
      )}
    </>
  )
}
