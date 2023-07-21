import { EditorContent, BubbleMenu, useEditor } from '@tiptap/react'
import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  CodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
  QuoteIcon
} from './Icons'
import { useEffect, useState } from 'react'
import { extensions } from '@renderer/extensions/extensions'
import { defualtContent } from './defaultContent'

const autoParse = (data?: string): object | string | null => {
  if (!data) {
    return null
  }
  try {
    const json = JSON.parse(data)
    return json
  } catch (err) {
    return data
  }
}

const Tiptap = (props: { content?: string }): JSX.Element => {
  const [data, setData] = useState(autoParse(props.content))
  const [filePath, setFilePath] = useState('')
  const editor = useEditor({
    extensions: extensions,
    content: data ? data : defualtContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert p-3 bg-white',
        spellcheck: 'false'
      }
    },
    onUpdate(props: { editor: Editor; tr: Transaction }): void {
      if (!filePath) {
        return
      }
      // const state = props.editor.view.state
      // const markdown = customMarkdownSerializer.serialize(state.doc)
      // ipcRenderer.invoke('file-write', filePath, JSON.stringify(editor?.getJSON()))
    }
  })
  const [isEditable, setIsEditable] = useState(true)

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable)
    }
  }, [isEditable, editor])

  useEffect(() => {
    let editorData = data
    try {
      const jsonEditorData = JSON.parse(data)
      editorData = jsonEditorData
    } catch (err) {
      editorData = data
    }
    if (editor) {
      editor.commands.setContent(editorData)
    }
  }, [data])

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
                  className: editor.isActive(item.symbol) ? 'active' : 'icon',
                  width: 14,
                  height: 14
                })}
              </button>
            ))}
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} className="editor-view" />
    </>
  )
}
export default Tiptap
