import { Editor, Range } from '@tiptap/react'
import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  ReactNode,
  useImperativeHandle,
  forwardRef
} from 'react'

export interface CommandItemProps {
  name: string
  icon: ({ className, width, height }) => ReactNode
  description: string
  command: (command: CommandProps) => void
}

export interface CommandProps {
  editor: Editor
  range: Range
}

export interface CommandOptions {
  items: CommandItemProps[]
  command: any
  editor: any
  range: any
}

const SuggestReactComponent = forwardRef((props: CommandOptions, ref): ReactNode => {
  const { items, command, editor, range } = props
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectItem = (index: number): void => {
    const item = items[index]
    if (item) {
      command(item)
    }
  }

  const upHandler = (): void => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = (): void => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = (): void => {
    selectItem(selectedIndex)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }): boolean => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }
      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }
      if (event.key === 'Enter') {
        enterHandler()
        return true
      }
      return false
    }
  }))

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
    <>
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
              {item.icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 bg-white">
                  {item.icon ? item.icon({ className: 'icon', width: 20, height: 20 }) : null}
                </div>
              )}
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-stone-500">{item.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </>
  ) : null
})
SuggestReactComponent.displayName = 'SuggestComponent'
export const SuggestComponent = SuggestReactComponent

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
