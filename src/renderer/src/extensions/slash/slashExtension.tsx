/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Extension, Editor, Range, ReactRenderer } from '@tiptap/react'
import { CommandProps, SlashComponent } from './slashComponent'
import tippy from 'tippy.js'
import { Plugin, PluginKey } from 'prosemirror-state'
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
  CodeBlockIcon
} from '@renderer/components/Icons'
import { Suggestion } from '../suggestion/suggestion'
import { suggestionLanguages } from '../codeblock/suggestions'

const slashSuggestionsKey = new PluginKey('slashSuggestions')

const SlashExtension = Extension.create({
  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: any }): void => {
          props.command({ editor, range })
        }
      }
    }
  },

  addProseMirrorPlugins(): Plugin[] {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ]
  }
})

const defaultRender = (): any => {
  let component: ReactRenderer | null = null
  let popup: any | null = null

  return {
    onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
      component = new ReactRenderer(SlashComponent, {
        props,
        editor: props.editor
      })
      // @ts-ignore
      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start'
      })
    },

    onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
      component?.updateProps(props)
      if (!props.clientRect) {
        return
      }
      popup[0].setProps({
        getReferenceClientRect: props.clientRect
      })
    },

    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === 'Escape') {
        popup?.[0].hide()
        return true
      }
      if (props.event.key === 'Enter') {
        return true
      }
      return false
    },

    onExit: () => {
      popup?.[0].destroy()
      component?.destroy()
    }
  }
}

const getItems = ({ query }: { query: string }) => {
  const items = [
    {
      title: 'Heading 1',
      icon: Heading1Icon,
      description: 'first level heading',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
      }
    },
    {
      title: 'Heading 2',
      icon: Heading2Icon,
      description: 'second level heading',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
      }
    },
    {
      title: 'Heading 3',
      icon: Heading3Icon,
      description: 'third level heading',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
      }
    },
    {
      title: 'Bulleted List',
      icon: BulletedListIcon,
      description: 'turn into unsorted list',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      }
    },
    {
      title: 'Ordered List',
      icon: NumberedListIcon,
      description: 'turn into sorted list',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      }
    },
    {
      title: 'Table',
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
      title: 'Task',
      icon: TaskIcon,
      description: 'tracking todo tasks',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      }
    },
    {
      title: 'Quote',
      icon: QuoteIcon,
      description: 'quote text',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      }
    },
    {
      title: 'Excalidraw',
      icon: ExcalidrawIcon,
      description: 'drawing with Excalidraw',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).insertExcalidraw().run()
      }
    },
    {
      title: 'Code Block',
      icon: CodeBlockIcon,
      description: 'create code block',
      command: ({ editor, range }: CommandProps) => {
        editor.chain().focus().deleteRange(range).setCodeBlock({ language: 'Plain' }).run()
      }
    }
  ]
  if (!query || query === '') {
    return items
  }
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  )
}

const Slash = SlashExtension.configure({
  suggestion: {
    items: getItems,
    render: defaultRender
  }
})

const LanguageSuggestion = SlashExtension.configure({
  suggestion: {
    char: '```',
    pluginKey: new PluginKey('languageSuggestions'),
    items: suggestionLanguages,
    render: defaultRender
  }
})

export default Slash
export { Slash, LanguageSuggestion }
