import { CommandProps } from '../suggestion/suggestComponent'
import {
  TableIcon,
  QuoteIcon,
  TaskIcon,
  BulletedListIcon,
  NumberedListIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ExcalidrawIcon,
  CodeBlockIcon,
  TextIcon
} from '@renderer/components/Icons'

export const suggestSlashCommands = ({ query }: { query: string }) => {
  const items = [
    {
      name: 'Heading 1',
      icon: Heading1Icon,
      description: 'first level heading',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
      }
    },
    {
      name: 'Heading 2',
      icon: Heading2Icon,
      description: 'second level heading',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
      }
    },
    {
      name: 'Heading 3',
      icon: Heading3Icon,
      description: 'third level heading',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
      }
    },
    {
      name: 'Bulleted List',
      icon: BulletedListIcon,
      description: 'turn into unsorted list',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      }
    },
    {
      name: 'Ordered List',
      icon: NumberedListIcon,
      description: 'turn into sorted list',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      }
    },
    {
      name: 'Table',
      icon: TableIcon,
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
      icon: TaskIcon,
      description: 'tracking todo tasks',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      }
    },
    {
      name: 'Quote',
      icon: QuoteIcon,
      description: 'quote text',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      }
    },
    {
      name: 'Excalidraw',
      icon: ExcalidrawIcon,
      description: 'drawing with Excalidraw',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).insertExcalidraw().run()
      }
    },
    {
      name: 'Code Block',
      icon: CodeBlockIcon,
      description: 'create codeblock',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setCodeBlock({ language: 'Plain' }).run()
      }
    },
    {
      name: 'Text',
      icon: TextIcon,
      description: 'plain text',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setParagraph().run()
      }
    }
  ]
  if (!query || query === '') {
    return items
  }
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  )
}
