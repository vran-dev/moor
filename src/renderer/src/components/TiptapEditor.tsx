import { EditorContent, BubbleMenu } from '@tiptap/react'
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  CodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
  QuoteIcon
} from './Icons'

const Tiptap = (props: { editor; setIsEditable }): JSX.Element => {
  const editor = props.editor

  interface BubbleMenuItem {
    icon: ({ className, width, height }) => JSX.Element
    name: string
    symbol: string
    onclick: () => boolean | undefined
  }

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
        <BubbleMenu editor={editor} onChange={(): void => setIsEditable(!isEditable)}>
          <div className="bubble-menu">
            {menuItems.map((item) => (
              <button key={item.name} onClick={item.onclick} className={'bubble-menu-item'}>
                {item.icon({
                  className: editor.isActive(item.symbol) ? 'icon active' : 'icon',
                  width: 14,
                  height: 14
                })}
              </button>
            ))}
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} className="view" />
    </>
  )
}
export default Tiptap
