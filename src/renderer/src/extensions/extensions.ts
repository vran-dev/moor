import StarterKit from '@tiptap/starter-kit'
import { CustomLink } from '@renderer/extensions/link/link'
import CustomImage from '@renderer/extensions/image/image'
import CustomTable from '@renderer/extensions/table/table'
import { CustomCodeBlock } from '@renderer/extensions/codeblock/codeBlock'
import ExcalidrawNode from '@renderer/extensions/excalidraw/excalidraw'
import TableHeader from '@tiptap/extension-table-header'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Dropcursor from '@tiptap/extension-dropcursor'
import { HexColorHighlighter } from '@renderer/extensions/color/hexColorHighlighter'
import {
  LanguageSuggestion,
  SlashCommandSuggestion,
  LinkSuggestion
} from '@renderer/extensions/suggestion/suggestExtension'
import { Markdown } from 'tiptap-markdown'
import { Node } from 'prosemirror-model'
import { frontMatter } from './matter/frontMatter'
import Highlight from '@tiptap/extension-highlight'
import { Find } from './search/findExtension'
import { CustomTableRow } from './table/tableRow'
import { CustomTableCell } from './table/tableCell'
import { CustomTableHeader } from './table/tableHeader'

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
  HexColorHighlighter,
  Dropcursor.configure({
    width: 2,
    color: '#00a8ff'
  }),
  StarterKit.configure({
    codeBlock: false,
    // horizontalRule: false,
    dropcursor: false
  }),
  CustomCodeBlock,
  TaskList.configure({
    itemTypeName: 'taskItem',
    HTMLAttributes: {
      class: 'not-prose pl-2'
    }
  }),
  TaskItem.configure({
    HTMLAttributes: {
      class: 'flex items-start my-4'
    },
    nested: true
  }),
  customPlaceholderExtension,
  Underline,
  CustomLink.configure({
    HTMLAttributes: {
      class: 'not-prose link'
    }
  }),
  CustomImage,
  CustomTable.configure({
    resizable: true,
    allowTableNodeSelection: true,
    HTMLAttributes: {
      class: 'border-y'
    }
  }),
  CustomTableHeader,
  CustomTableRow,
  CustomTableCell,
  Find,
  SlashCommandSuggestion,
  LanguageSuggestion,
  LinkSuggestion,
  Highlight.configure({
    multicolor: true
  }),
  ExcalidrawNode.configure({
    HTMLAttributes: {
      class: 'not-prose'
    }
  })
]
