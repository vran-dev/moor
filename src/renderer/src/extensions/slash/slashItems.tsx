/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { CommandProps } from '../suggestion/suggestComponent'
import { Editor } from '@tiptap/react'

import { ExcalidrawIcon } from '@renderer/components/Icons'

import {
  AiOutlineTable,
  AiOutlineUnorderedList,
  AiOutlineOrderedList,
  AiOutlineCheckSquare,
  AiOutlineFontSize,
  AiOutlineCode,
  AiOutlineDelete,
  AiOutlineInsertRowAbove,
  AiOutlineInsertRowBelow,
  AiOutlineInsertRowLeft,
  AiOutlineInsertRowRight,
  AiOutlineDeleteRow,
  AiOutlineDeleteColumn
} from 'react-icons/ai'
import { LuHeading1, LuHeading2, LuHeading3, LuHeading4 } from 'react-icons/lu'
import { LiaQuoteLeftSolid } from 'react-icons/lia'
import ProsemirrorNodes from '@renderer/common/prosemirrorNodes'

const ICON_SIZE = 20

const ICON_PROPS = {
  size: ICON_SIZE,
  color: '#131313'
}

const selectColumn = ({ editor, className }) => {
  const anchor = editor.view.state.selection.$anchor
  const cellPos = ProsemirrorNodes.getAncestorNodePos(editor.view, () => anchor.pos, 'tableCell')
  const tablePos = ProsemirrorNodes.getAncestorNodePos(editor.view, () => anchor.pos, 'table')
  const rowPos = ProsemirrorNodes.getAncestorNodePos(editor.view, () => anchor.pos, 'tableRow')
  const cellNode = editor.state.doc.nodeAt(cellPos)
  let colIndex = 0
  let colMatched = false
  editor.state.doc.nodeAt(rowPos)?.descendants((node, pos) => {
    if (colMatched) {
      return false
    }
    if (node.type.name === 'tableCell') {
      if (node === cellNode) {
        colMatched = true
        return false
      } else {
        colIndex++
      }
    }
  })
  const tableNode = editor.state.doc.nodeAt(tablePos)
  let rowIndex = -1
  let rowCol = 0
  let match = false
  editor.state.doc.descendants((node, pos) => {
    if (node === tableNode) {
      if (match) {
        return false
      }
      match = true
    }
    if (match) {
      if (node.type.name === 'tableRow') {
        rowIndex++
        rowCol = 0
      }
      if (node.type.name === 'tableCell') {
        if (colIndex === rowCol) {
          rowCol++
          const { state, dispatch } = editor.view
          const tr = editor.view.state.tr.setNodeAttribute(pos, 'className', className)
          dispatch(tr)
          return false
        } else {
          rowCol++
        }
      }
    }
  })
}

export const suggestSlashCommands = ({ editor, query }: { editor: Editor; query: string }) => {
  const selection = editor.view.state.selection
  const isInTable = ProsemirrorNodes.hasAncestorNode(
    editor.view,
    () => selection.$from.pos,
    'table'
  )
  const tableItems = [
    {
      name: 'Add Row Above',
      icon: <AiOutlineInsertRowAbove {...ICON_PROPS} />,
      description: 'Insert new row before current row',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).addRowBefore().run()
      }
    },
    {
      name: 'Add Row After',
      description: 'Insert new row after current row',
      icon: <AiOutlineInsertRowBelow {...ICON_PROPS} />,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).addRowAfter().run()
      }
    },
    {
      name: 'Add Column Before',
      description: 'Insert new column before current column',
      icon: <AiOutlineInsertRowLeft {...ICON_PROPS} />,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).addColumnBefore().run()
      }
    },
    {
      name: 'Add Column After',
      description: 'Insert new column after current column',
      icon: <AiOutlineInsertRowRight {...ICON_PROPS} />,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).addColumnAfter().run()
      }
    },
    {
      name: 'Delete Current Row',
      description: 'Delete row at the current position',
      icon: <AiOutlineDeleteRow {...ICON_PROPS} />,
      onUnselect: ({ editor }: { editor: Editor }) => {
        const selection = editor.view.state.selection
        const anchor = selection.$anchor
        const rowNodePos = ProsemirrorNodes.getAncestorNodePos(
          editor.view,
          () => anchor.pos,
          'tableRow'
        )
        if (rowNodePos) {
          const { state, dispatch } = editor.view
          const tr = editor.view.state.tr.setNodeAttribute(rowNodePos, 'className', '')
          dispatch(tr)
        }
      },
      onSelect: ({ editor }: { editor: Editor }) => {
        const selection = editor.view.state.selection
        const anchor = selection.$anchor
        const rowNodePos = ProsemirrorNodes.getAncestorNodePos(
          editor.view,
          () => anchor.pos,
          'tableRow'
        )
        if (rowNodePos) {
          const { state, dispatch } = editor.view
          const tr = editor.view.state.tr.setNodeAttribute(rowNodePos, 'className', 'selected')
          dispatch(tr)
        }
      },
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).deleteRow().run()
      }
    },
    {
      name: 'Delete Current Column',
      description: 'Delete column at the current position',
      icon: <AiOutlineDeleteColumn {...ICON_PROPS} />,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).deleteColumn().run()
      },
      onSelect: ({ editor }: { editor: Editor }) => {
        selectColumn({ editor: editor, className: 'selected' })
      },
      onUnselect: ({ editor }: { editor: Editor }) => {
        selectColumn({ editor: editor, className: '' })
      }
    },
    {
      name: 'Delete Table',
      description: 'Delete entire table at the current position',
      icon: <AiOutlineDelete {...ICON_PROPS} />,
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).deleteTable().run()
      }
    }
  ]

  const items = [
    {
      name: 'Heading 1',
      icon: <LuHeading1 {...ICON_PROPS} />,
      description: 'first level heading',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
      }
    },
    {
      name: 'Heading 2',
      icon: <LuHeading2 {...ICON_PROPS} />,
      description: 'second level heading',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
      }
    },
    {
      name: 'Heading 3',
      icon: <LuHeading3 {...ICON_PROPS} />,
      description: 'third level heading',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
      }
    },
    {
      name: 'Bulleted List',
      icon: <AiOutlineUnorderedList {...ICON_PROPS} />,
      description: 'turn into unsorted list',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      }
    },
    {
      name: 'Ordered List',
      icon: <AiOutlineOrderedList {...ICON_PROPS} />,
      description: 'turn into sorted list',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      }
    },
    {
      name: 'Table',
      icon: <AiOutlineTable {...ICON_PROPS} />,
      description: 'create simple table',
      command: ({ editor, range }: CommandProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run()
      }
    },
    {
      name: 'Task',
      icon: <AiOutlineCheckSquare {...ICON_PROPS} />,
      description: 'tracking todo tasks',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      }
    },
    {
      name: 'Quote',
      icon: <LiaQuoteLeftSolid {...ICON_PROPS} />,
      description: 'quote text',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      }
    },
    {
      name: 'Excalidraw',
      icon: ExcalidrawIcon({ width: ICON_SIZE, height: ICON_SIZE }),
      description: 'drawing with Excalidraw',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).insertExcalidraw().run()
      }
    },
    {
      name: 'Code Block',
      icon: <AiOutlineCode {...ICON_PROPS} />,
      description: 'create codeblock',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setCodeBlock({ language: 'Plain' }).run()
      }
    },
    {
      name: 'Text',
      icon: <AiOutlineFontSize {...ICON_PROPS} />,
      description: 'plain text',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setParagraph().run()
      }
    }
  ]
  if (isInTable) {
    items.unshift(...tableItems)
  }
  if (!query || query === '') {
    return items
  }
  return items.filter(
    (item) =>
      item.name.toLowerCase().replaceAll(' ', '').includes(query.toLowerCase()) ||
      item.description.toLowerCase().replaceAll(' ', '').includes(query.toLowerCase())
  )
}
