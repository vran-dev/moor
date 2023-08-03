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
  AiOutlineDeleteColumn,
  AiOutlineSmile,
  AiOutlineCalendar
} from 'react-icons/ai'
import { LuHeading1, LuHeading2, LuHeading3, LuHeading4 } from 'react-icons/lu'
import { LiaQuoteLeftSolid } from 'react-icons/lia'
import ProsemirrorNodes from '@renderer/common/prosemirrorNodes'
import { DEFAULT_DATETIME_PATTERN } from '@renderer/common/days'
import dayjs from 'dayjs'

const ICON_SIZE = 20

const ICON_PROPS = {
  size: ICON_SIZE
}

const selectTableColumn = ({ editor, range, className }) => {
  const cellPos = ProsemirrorNodes.getAncestorNodePos(editor.view, () => range.from, 'tableCell')
  const tablePos = ProsemirrorNodes.getAncestorNodePos(editor.view, () => range.from, 'table')
  const rowPos = ProsemirrorNodes.getAncestorNodePos(editor.view, () => range.from, 'tableRow')
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
    if (node.type.name === 'table' && match) {
      return false
    }
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
      if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
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

const selectTableRow = ({ editor, range, className }) => {
  const rowNodePos = ProsemirrorNodes.getAncestorNodePos(editor.view, () => range.from, 'tableRow')
  if (rowNodePos) {
    const { state, dispatch } = editor.view
    const tr = editor.view.state.tr.setNodeAttribute(rowNodePos, 'className', className)
    dispatch(tr)
  }
}

const selectTable = ({ editor, range, className }) => {
  const tableNodePos = ProsemirrorNodes.getAncestorNodePos(editor.view, () => range.from, 'table')
  if (tableNodePos) {
    const tableNode = editor.state.doc.nodeAt(tableNodePos)
    let match = false
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'table' && match) {
        return false
      }
      if (node === tableNode) {
        match = true
      }
      if (match && node.type.name === 'tableRow') {
        const { state, dispatch } = editor.view
        const tr = editor.view.state.tr.setNodeAttribute(pos, 'className', className)
        dispatch(tr)
        return false
      }
    })
  }
}

const defaultItems = [
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
    name: 'Emoji',
    icon: <AiOutlineSmile {...ICON_PROPS} />,
    description: 'select emoji from picker',
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).deleteRow().run()
      const tr = editor.view.state.tr.insertText('::')
      editor.view.dispatch(tr)
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

const tableItems = [
  {
    name: 'Add Row Above',
    icon: <AiOutlineInsertRowAbove {...ICON_PROPS} />,
    description: 'Insert new row before current row',
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).addRowBefore().run()
    },
    onSelect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableRow({ editor: editor, range: range, className: 'select-top' })
    },
    onUnselect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableRow({ editor: editor, range: range, className: '' })
    }
  },
  {
    name: 'Add Row After',
    description: 'Insert new row after current row',
    icon: <AiOutlineInsertRowBelow {...ICON_PROPS} />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).addRowAfter().run()
    },
    onSelect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableRow({ editor: editor, range: range, className: 'select-bottom' })
    },
    onUnselect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableRow({ editor: editor, range: range, className: '' })
    }
  },
  {
    name: 'Add Column Before',
    description: 'Insert new column before current column',
    icon: <AiOutlineInsertRowLeft {...ICON_PROPS} />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).addColumnBefore().run()
    },
    onSelect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableColumn({ editor: editor, range: range, className: 'select-left' })
    },
    onUnselect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableColumn({ editor: editor, range: range, className: '' })
    }
  },
  {
    name: 'Add Column After',
    description: 'Insert new column after current column',
    icon: <AiOutlineInsertRowRight {...ICON_PROPS} />,
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).addColumnAfter().run()
    },
    onSelect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableColumn({ editor: editor, range: range, className: 'select-right' })
    },
    onUnselect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableColumn({ editor: editor, range: range, className: '' })
    }
  },
  {
    name: 'Delete Current Row',
    description: 'Delete row at the current position',
    icon: <AiOutlineDeleteRow {...ICON_PROPS} />,
    onSelect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableRow({ editor: editor, range: range, className: 'selected' })
    },
    onUnselect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableRow({ editor: editor, range: range, className: '' })
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
    onSelect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableColumn({ editor: editor, range: range, className: 'selected' })
    },
    onUnselect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTableColumn({ editor: editor, range: range, className: '' })
    }
  },
  {
    name: 'Delete Table',
    description: 'Delete entire table at the current position',
    icon: <AiOutlineDelete {...ICON_PROPS} />,
    onSelect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTable({ editor: editor, range: range, className: 'selected' })
    },
    onUnselect: ({ editor, range }: { editor: Editor; range: Range }) => {
      selectTable({ editor: editor, range: range, className: '' })
    },
    command: ({ editor, range }: CommandProps) => {
      editor.chain().focus().deleteRange(range).deleteTable().run()
    }
  }
]

const timeItems = [
  {
    name: 'Today',
    icon: <AiOutlineCalendar {...ICON_PROPS} />,
    description: 'Insert date time at today',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(dayjs().format(DEFAULT_DATETIME_PATTERN))
        .run()
    }
  },
  {
    name: 'Tomorrow',
    icon: <AiOutlineCalendar {...ICON_PROPS} />,
    description: 'Insert date time at tomorrow',
    command: ({ editor, range }: CommandProps) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent(dayjs().add(1, 'd').format(DEFAULT_DATETIME_PATTERN))
        .run()
    }
  }
]

export const suggestSlashCommands = ({ editor, query }: { editor: Editor; query: string }) => {
  const selection = editor.view.state.selection
  const isInTable = ProsemirrorNodes.hasAncestorNode(
    editor.view,
    () => selection.$from.pos,
    'table'
  )

  const items = [...defaultItems, ...timeItems]
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
