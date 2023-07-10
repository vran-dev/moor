/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Extension, Editor, Range, ReactRenderer } from '@tiptap/react'
import Suggestion from '@tiptap/suggestion'
import tippy from 'tippy.js'
import React, { useState, useEffect, ReactNode, useRef, useLayoutEffect } from 'react'
import {
  TableIcon,
  QuoteIcon,
  TaskIcon,
  BulletedListIcon,
  NumberedListIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ExcalidrawIcon
} from '@renderer/components/Icons'

interface CommandItemProps {
  title: string
  icon: ({ className, width, height }) => JSX.Element
  description: string
  command: (command: Command) => void
}

interface Command {
  editor: Editor
  range: Range
}

const SlashExtension = Extension.create({
  name: 'slash',

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

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ]
  }
})

const SlashComponent = ({
  items,
  command,
  editor,
  range
}: {
  items: CommandItemProps[]
  command: any
  editor: any
  range: any
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectItem = (index: number) => {
    const item = items[index]
    if (item) {
      command(item)
    }
  }

  useEffect(() => {
    const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter']
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault()
        if (e.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length)
          return true
        }
        if (e.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % items.length)
          return true
        }
        if (e.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
        return false
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [items, selectedIndex, setSelectedIndex, selectItem])

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  const commandListContainer = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const container = commandListContainer?.current

    const item = container?.children[selectedIndex] as HTMLElement

    if (item && container) updateScrollView(container, item)
  }, [selectedIndex])

  return items.length > 0 ? (
    <div
      id="slash-command"
      ref={commandListContainer}
      className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-stone-200 bg-white px-1 py-2 shadow-md transition-all"
    >
      {items.map((item: CommandItemProps, index: number) => {
        return (
          <button
            className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm text-stone-600 hover:bg-stone-100 ${
              index === selectedIndex ? 'bg-stone-100 text-stone-900' : ''
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 bg-white">
              {item.icon({ className: 'icon', width: 20, height: 20 })}
            </div>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-stone-500">{item.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  ) : null
}

const defaultRender = (): any => {
  let component: ReactRenderer | null = null
  let popup: any | null = null

  return {
    onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
      component = new ReactRenderer(SlashComponent, {
        props,
        editor: props.editor
      })

      if (!props.clientRect) {
        return
      }

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
      return component?.ref.onKeyDown(props)
    },

    onExit: () => {
      popup?.[0].destroy()
      component?.destroy()
    }
  }
}

export const updateScrollView = (container: HTMLElement, item: HTMLElement) => {
  const containerHeight = container.offsetHeight
  const itemHeight = item ? item.offsetHeight : 0

  const top = item.offsetTop
  const bottom = top + itemHeight

  if (top < container.scrollTop) {
    container.scrollTop -= container.scrollTop - top + 5
  } else if (bottom > containerHeight + container.scrollTop) {
    container.scrollTop += bottom - containerHeight - container.scrollTop + 5
  }
}

const getItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Heading 1',
      icon: Heading1Icon,
      description: 'first level heading',
      command: ({ editor, range }: Command) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
      }
    },
    {
      title: 'Heading 2',
      icon: Heading2Icon,
      description: 'second level heading',
      command: ({ editor, range }: Command) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
      }
    },
    {
      title: 'Heading 3',
      icon: Heading3Icon,
      description: 'third level heading',
      command: ({ editor, range }: Command) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
      }
    },
    {
      title: 'Bulleted List',
      icon: BulletedListIcon,
      description: 'turn into unsorted list',
      command: ({ editor, range }: Command) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      }
    },
    {
      title: 'Ordered List',
      icon: NumberedListIcon,
      description: 'turn into sorted list',
      command: ({ editor, range }: Command) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      }
    },
    {
      title: 'Table',
      icon: TableIcon,
      description: 'create simple table',
      command: ({ editor, range }: Command) => {
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
      command: ({ editor, range }: Command) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      }
    },
    {
      title: 'Quote',
      icon: QuoteIcon,
      description: 'quote text',
      command: ({ editor, range }: Command) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      }
    },
    {
      title: 'Excalidraw',
      icon: ExcalidrawIcon,
      description: 'drawing with Excalidraw',
      command: ({ editor, range }: Command) => {
        editor.chain().focus().deleteRange(range).insertExcalidraw().run()
      }
    }
  ]
    .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    .filter((item) => item.description.toLowerCase().includes(query.toLowerCase()))
}

const Slash = SlashExtension.configure({
  suggestion: {
    items: getItems,
    render: defaultRender
  }
})

export default Slash
