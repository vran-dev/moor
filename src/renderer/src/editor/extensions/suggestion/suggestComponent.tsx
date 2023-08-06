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

export interface CommandItemProps {
  name: string
  icon?: ReactNode
  description: string
  command: (command: CommandProps) => void
  onSelect?: ({ editor, range }: { editor: Editor; range: Range }) => void
  onUnselect?: ({ editor, range }: { editor: Editor; range: Range }) => void
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
  const prevSelectedItem = useRef<CommandItemProps>()
  const [mouseSelectEnabled, settMouseSelectEnabled] = useState(false)

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

  const triggerUnSelectIndex = (index: number | undefined): void => {
    if (index !== undefined) {
      const prevItem = items[index]
      triggerUnSelectItem(prevItem)
    }
  }

  const triggerSelectIndex = (index: number | undefined): void => {
    if (index !== undefined) {
      const item = items[index]
      if (item && item.onSelect) {
        item.onSelect({ editor, range })
      }
    }
  }

  const triggerUnSelectItem = (item: CommandItemProps | null | undefined): void => {
    if (item && item.onUnselect) {
      item.onUnselect({ editor, range })
    }
  }

  useEffect(() => {
    triggerUnSelectItem(prevSelectedItem.current)
    triggerSelectIndex(selectedIndex)
    if (selectedIndex !== undefined) {
      prevSelectedItem.current = items[selectedIndex]
    } else {
      prevSelectedItem.current = undefined
    }
    return () => {
      triggerUnSelectIndex(selectedIndex)
    }
  }, [selectedIndex])

  useEffect(() => {
    triggerUnSelectItem(prevSelectedItem.current)
    if (items.length) {
      prevSelectedItem.current = items[0]
      setSelectedIndex(0)
      triggerSelectIndex(0)
    }
  }, [items])

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    scrollPaddingStart: 12,
    scrollPaddingEnd: 12,
    getScrollElement: () => commandListContainer.current,
    estimateSize: (index) => {
      const item = items[index]
      if (item) {
        if (item.description) {
          return 52
        } else {
          return 32
        }
      }
      return 0
    }
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

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }): boolean => {
      if (!items || items.length === 0) return false
      settMouseSelectEnabled(false)
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }
      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }
      if (event.key === 'Enter') {
        triggerUnSelectItem(prevSelectedItem.current)
        triggerUnSelectIndex(selectedIndex)
        enterHandler()
        return true
      }
      return false
    },

    onHide: ({ instance }): void => {
      triggerUnSelectItem(prevSelectedItem.current)
      triggerUnSelectIndex(selectedIndex)
    }
  }))

  return items.length > 0 ? (
    <>
      <div
        ref={commandListContainer}
        className="suggest-wrapper"
        onMouseMove={() => settMouseSelectEnabled(true)}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`
          }}
          className="suggest-main"
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
                onMouseOver={(): void => mouseSelectEnabled && setSelectedIndex(virtualItem.index)}
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
