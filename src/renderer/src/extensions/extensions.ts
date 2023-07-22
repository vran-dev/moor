import StarterKit from '@tiptap/starter-kit'
import { CustomLink } from '@renderer/extensions/link/link'
import CustomImage from '@renderer/extensions/image/image'
import CustomTable from '@renderer/extensions/table/table'
import { CustomCodeBlock } from '@renderer/extensions/codeblock/codeBlock'
import ExcalidrawNode from '@renderer/extensions/excalidraw/excalidraw'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Search } from '@renderer/extensions/search/searchExtension'
import { HexColorHighlighter } from '@renderer/extensions/color/hexColorHighlighter'
import {
  LanguageSuggestion,
  SlashCommandSuggestion
} from '@renderer/extensions/suggestion/suggestExtension'
import { Markdown } from 'tiptap-markdown'
import { Node } from 'prosemirror-model'
import { frontMatter } from './matter/frontMatter'

const customPlaceholderExtension = Placeholder.configure({
  placeholder: ({ editor, node, pos }) => {
    if (node.type.name === 'heading') {
      return `Heading ${node.attrs.level}`
    }
    if (node.type.name === 'codeBlock') {
      return `Writing code...`
    }
    if (pos == 0 && node.type.name !== 'codeBlock') {
      return "Writing or Press '/' for commands"
    }
    const doc = editor.view.state.doc

    let p = doc
    doc.descendants((curr: Node, currPos: number, parent: Node): boolean | void => {
      if (curr === node) {
        p = parent
        return false
      }
      if (currPos > pos) {
        return false
      }
    })
    if (p != null) {
      if (p.type.name === 'tableCell') {
        return ''
      }
      if (p.type.name === 'tableHeader') {
        return ''
      }
      if (p.type.name === 'codeBlock') {
        return ''
      }
    }
    return "Writing or Press '/' for commands"
  },
  includeChildren: true
})

export const extensions = [
  Markdown.configure({
    transformPastedText: true
  }),
  frontMatter,
  Search,
  HexColorHighlighter,
  StarterKit.configure({
    codeBlock: false,
    horizontalRule: false
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
  customPlaceholderExtension,
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
  }),
  SlashCommandSuggestion,
  LanguageSuggestion
]
