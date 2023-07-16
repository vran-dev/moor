import { Editor } from '@tiptap/react'
import { useState, useEffect, useRef, useLayoutEffect, ReactNode } from 'react'

export interface CommandItemProps {
  title: string
  icon: ({ className, width, height }) => JSX.Element
  description: string
  command: (command: CommandProps) => void
}

export interface CommandProps {
  editor: Editor
  range: Range
}

export const SlashComponent = ({
  items,
  command,
  editor,
  range
}: {
  items: CommandItemProps[]
  command: any
  editor: any
  range: any
}): ReactNode => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectItem = (index: number): void => {
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
    return (): void => {
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
      className="z-999 h-auto max-h-[330px] w-72 overflow-y-auto overflow-x-hidden rounded-md border border-stone-200 bg-white px-1 py-2 shadow-md"
    >
      {items.map((item: CommandItemProps, index: number) => {
        return (
          <button
            className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm text-stone-600 hover:bg-stone-100 ${
              index === selectedIndex ? 'bg-stone-100 text-stone-900' : ''
            }`}
            key={index}
            onClick={(): void => selectItem(index)}
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

export const updateScrollView = (container: HTMLElement, item: HTMLElement): void => {
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
