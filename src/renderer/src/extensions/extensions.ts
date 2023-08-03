import StarterKit from '@tiptap/starter-kit'
import { CustomLink } from '@renderer/extensions/link/link'
import CustomImage from '@renderer/extensions/image/image'
import CustomTable from '@renderer/extensions/table/table'
import { CustomCodeBlock } from '@renderer/extensions/codeblock/codeBlock'
import ExcalidrawNode from '@renderer/extensions/excalidraw/excalidraw'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import Dropcursor from '@tiptap/extension-dropcursor'
import { HexColorHighlighter } from '@renderer/extensions/color/hexColorHighlighter'
import {
  LanguageSuggestion,
  SlashCommandSuggestion,
  LinkSuggestion,
  EmojiSuggestion
} from '@renderer/extensions/suggestion/suggestExtension'
import { Markdown } from 'tiptap-markdown'
import { frontMatter } from './matter/frontMatter'
import Highlight from '@tiptap/extension-highlight'
import { Find } from './search/findExtension'
import { CustomTableRow } from './table/tableRow'
import { CustomTableCell } from './table/tableCell'
import { CustomTableHeader } from './table/tableHeader'
import { TaskItem } from './task/taskItem'
import { customPlaceholderExtension } from './placeholder/placeholder'

export const extensions = [
  Markdown.configure({
    transformPastedText: true
  }),

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
