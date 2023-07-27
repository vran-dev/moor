import { useVirtualizer } from '@tanstack/react-virtual'
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

import '@renderer/assets/suggest.css'

export interface CommandItemProps {
  name: string
  icon?: ReactNode
  description: string
  command: (command: CommandProps) => void
  onSelect?: ({ editor }) => void
  onUnselect?: ({ editor }) => void
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
  const prevSelectedIndexRef = useRef<number>(0)
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
      if (!items || items.length === 0) return false
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
    if (selectedIndex !== undefined) {
      const item = items[selectedIndex]
      if (item && item.onSelect) {
        item.onSelect({ editor })
      }
    }

    if (prevSelectedIndexRef.current !== undefined) {
      const prevItem = items[prevSelectedIndexRef.current]
      if (prevItem && prevItem.onUnselect) {
        prevItem.onUnselect({ editor })
      }
    }
    prevSelectedIndexRef.current = selectedIndex
    return () => {
      if (selectedIndex !== undefined) {
        const curr = items[prevSelectedIndexRef.current]
        if (curr && curr.onUnselect) {
          curr.onUnselect({ editor })
        }
      }
    }
  }, [selectedIndex])

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => commandListContainer.current,
    estimateSize: () => 60
  })

  const commandListContainer = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!rowVirtualizer || !rowVirtualizer.scrollElement) {
      return
    }
    if (selectedIndex !== undefined) {
      // FIXME when scroll to bottom, the last item is not visible fully
      rowVirtualizer.scrollToIndex(selectedIndex, {})
    }
  }, [selectedIndex])

  return items.length > 0 ? (
    <>
      <div ref={commandListContainer} className="suggest-main">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${rowVirtualizer.getVirtualItems()[0].start}px)`
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
              >
                <button
                  className={`item ${virtualItem.index === selectedIndex ? 'selected' : ''}`}
                  onClick={(): void => selectItem(virtualItem.index)}
                >
                  {items[virtualItem.index].icon && (
                    <div className="icon">
                      {items[virtualItem.index].icon ? items[virtualItem.index].icon : null}
                    </div>
                  )}
                  <div className={'content'}>
                    <div className="title">{items[virtualItem.index].name}</div>
                    <div className="description">{items[virtualItem.index].description}</div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  ) : null
})
SuggestReactComponent.displayName = 'SuggestComponent'
export const SuggestComponent = SuggestReactComponent
