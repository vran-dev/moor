import { useEditor, EditorContent, BubbleMenu, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { CustomLink } from '../extensions/link'
import CustomImage from '../extensions/image/image'
import CustomTable from '../extensions/table'
import { CustomCodeBlock } from '@renderer/extensions/codeblock/codeBlock'
import ExcalidrawNode from '@renderer/extensions/excalidraw/excalidraw'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import React, { useEffect } from 'react'
import { Search } from '@renderer/extensions/search/searchExtension'

import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  CodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
  QuoteIcon
} from './Icons'
import { HexColorHighlighter } from '@renderer/extensions/color/hexColorHighlighter'
import {
  LanguageSuggestion,
  SlashCommandSuggestion
} from '@renderer/extensions/suggestion/suggestExtension'
import { Transaction } from 'prosemirror-state'
import { defaultMarkdownSerializer } from 'prosemirror-markdown'
import { Markdown } from 'tiptap-markdown'
import { defualtContent } from './defaultContent'
import { Node } from 'prosemirror-model'

const Tiptap = (): JSX.Element => {
  const editor = useEditor({
    extensions: [
      Markdown,
      SlashCommandSuggestion,
      LanguageSuggestion,
      Search,
      HexColorHighlighter,
      StarterKit.configure({
        codeBlock: false
      }),
      CustomCodeBlock,
      ExcalidrawNode.configure({
        HTMLAttributes: {
          style: 'height: 500px;display:block',
          class: 'not-prose'
        }
      }),
      TaskList.configure({
        itemTypeName: 'taskItem',
        HTMLAttributes: {
          class: 'not-prose'
        }
      }),
      TaskItem.configure({
        nested: true
      }),
      Placeholder.configure({
        placeholder: ({ editor, node, pos }) => {
          if (pos == 0) {
            return "Writing or Press '/' for commands"
          }
          if (node.type.name === 'heading') {
            return `Heading ${node.attrs.level}`
          }
          if (node.type.name === 'codeBlock') {
            return `Writing code...`
          }
          const doc = editor.view.state.doc
          const nearbyNode = doc.nodeAt(pos - 1)
          if (nearbyNode && nearbyNode.type.name === 'tableCell') {
            return ''
          }
          return "Writing or Press '/' for commands"
        },
        includeChildren: true
      }),
      Underline,
      CustomLink,
      CustomImage,
      CustomTable.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'table-auto border border-stone-300 hover:outline hover:outline-blue-300'
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 bg-gray-100 dark:bg-gray-800 p-2'
        }
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'dark:border-stone-800'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 focus:bg-cyan-50 hover:z-20 p-2'
        }
      })
    ],
    content: defualtContent,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert p-3 bg-white',
        spellcheck: 'false'
      }
    },
    onUpdate(props: { editor: Editor; tr: Transaction }): void {
      // const state = props.editor.view.state
      // const markdown = defaultMarkdownSerializer.serialize(state.doc)
      // console.log(props.editor.storage.markdown.getMarkdown())
      // console.log(JSON.stringify(props.editor.getJSON()))
    }
  })
  const [isEditable, setIsEditable] = React.useState(true)

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable)
    }
  }, [isEditable, editor])

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
      <EditorContent
        editor={editor}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1',
          overflow: 'hidden auto',
          width: '100%',
          height: '100%',
          alignItems: 'center'
        }}
      />
    </>
  )
}
export default Tiptap
