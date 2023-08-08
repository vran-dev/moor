import StarterKit from '@tiptap/starter-kit'
import { CustomLink } from './link/link'
import CustomImage from './image/image'
import CustomTable from './table/table'
import { CustomCodeBlock } from './codeblock'
import ExcalidrawNode from './excalidraw/excalidraw'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import Dropcursor from '@tiptap/extension-dropcursor'
import { HexColorHighlighter } from './color/hexColorHighlighter'
import {
  LanguageSuggestion,
  SlashCommandSuggestion,
  LinkSuggestion,
  EmojiSuggestion
} from './suggestion/suggestExtension'
import { Markdown } from 'tiptap-markdown'
import { frontMatter } from './matter/frontMatter'
import Highlight from '@tiptap/extension-highlight'
import { Find } from './search/findExtension'
import { CustomTableRow } from './table/tableRow'
import { CustomTableCell } from './table/tableCell'
import { CustomTableHeader } from './table/tableHeader'
import { TaskItem } from './task/taskItem'
import { customPlaceholderExtension } from './placeholder/placeholder'
import { trallingNodeExtension } from './tralling-node/trallingNode'

export const extensions = [
  Markdown.configure({
    transformPastedText: true
  }),
  trallingNodeExtension,
  frontMatter,
  HexColorHighlighter,
  Dropcursor.configure({
    width: 2,
    color: '#00a8ff'
  }),
  StarterKit.configure({
    codeBlock: false,
    // horizontalRule: false,
    dropcursor: false,
    bulletList: {
      HTMLAttributes: {
        class: 'bullet-list'
      }
    },
    orderedList: {
      HTMLAttributes: {
        class: 'ordered-list'
      }
    }
  }),
  CustomCodeBlock,
  TaskList.configure({
    itemTypeName: 'taskItem',
    HTMLAttributes: {}
  }),
  TaskItem.configure({
    nested: true
  }),
  customPlaceholderExtension,
  Underline,
  CustomLink.configure({
    autolink: true
  }),
  CustomImage,
  CustomTable.configure({
    resizable: true,
    allowTableNodeSelection: true
  }),
  CustomTableHeader,
  CustomTableRow,
  CustomTableCell,
  Find,
  SlashCommandSuggestion,
  LanguageSuggestion,
  LinkSuggestion,
  EmojiSuggestion,
  Highlight.configure({
    multicolor: true
  }),
  ExcalidrawNode.configure({
    HTMLAttributes: {}
  })
]
