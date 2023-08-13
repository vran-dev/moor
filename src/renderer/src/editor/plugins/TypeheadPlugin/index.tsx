/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_NORMAL,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  RangeSelection
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './index.css'

import {
  useFloating,
  offset,
  flip,
  shift,
  inline,
  autoUpdate,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal
} from '@floating-ui/react'
import { getDOMRangeClientRect, getDOMRangeRect } from '@renderer/editor/utils/getDOMRangeRect'
import { useVirtualizer } from '@tanstack/react-virtual'

// from https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

function triggerRegexp(trigger: string) {
  const escapedChar = escapeRegExp(trigger)
  const prefix = ''
  const regexp = new RegExp(`${prefix}(?:^)?${escapedChar}[^\\s${escapedChar}]*`, 'gm')
  return regexp
}

export class TypeaheadMenu {
  title: string
  icon: React.ReactNode
  description: string
  keywords?: string[]
  command: (editor: LexicalEditor) => void
  onHover?: () => void
  onLeave?: () => void

  constructor(
    title: string,
    icon: React.ReactNode,
    description: string,
    command: (editor: LexicalEditor) => void,
    keywords?: string[],
    onHover?: () => void,
    onLeave?: () => void
  ) {
    this.title = title
    this.icon = icon
    this.description = description
    this.keywords = keywords || []
    this.command = command
    this.onHover = onHover
    this.onLeave = onLeave
  }
}

export interface Point {
  key: string
  offset: number
}

export function TypeaheadMenuComponent(props: {
  editor: LexicalEditor
  setRef: (node: HTMLElement | null) => void
  index: number
  options: TypeaheadMenu[]
  selectedIndex: number
}): JSX.Element {
  const { editor, setRef, index, options, selectedIndex } = props
  const option = options[index]
  return (
    <button
      data-index={index}
      ref={setRef}
      className={`typeahead-menu ${index === selectedIndex ? 'selected' : ''} `}
      onClick={(): void => {
        option.command(editor)
      }}
    >
      {option.icon && <div className="icon">{option.icon}</div>}
      <div className={'info'}>
        <div className="title">{option.title}</div>
        <div className="description">{option.description}</div>
      </div>
    </button>
  )
}

export function TypeaheadVirtualListMenu(props: {
  editor: LexicalEditor
  query: string
  trigger: string
  options: TypeaheadMenu[]
  closeTypeahead: (resetPosition?: boolean) => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { editor, options, query, trigger, closeTypeahead } = props
  const optionsContainerRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: options.length,
    scrollPaddingStart: 12,
    scrollPaddingEnd: 12,
    getScrollElement: () => optionsContainerRef.current,
    estimateSize: (index) => {
      const item = options[index]
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
  useLayoutEffect(() => {
    if (!rowVirtualizer || !rowVirtualizer.scrollElement) {
      return
    }
    if (selectedIndex !== undefined) {
      // FIXME when scroll to bottom, the last item is not visible fully
      rowVirtualizer.scrollToIndex(selectedIndex, {})
    }
  }, [selectedIndex])

  useEffect(() => {
    const updateSelectedIndex = (diff: number, event: KeyboardEvent) => {
      if (options !== null && options.length) {
        const newSelectedIndex = (selectedIndex + diff + options.length) % options.length
        setSelectedIndex(newSelectedIndex)
        event.preventDefault()
        event.stopImmediatePropagation()
        return true
      }
      return false
    }

    const keyListenerDestroy = mergeRegister(
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_DOWN_COMMAND,
        (payload) => {
          return updateSelectedIndex(1, payload)
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_UP_COMMAND,
        (payload) => {
          return updateSelectedIndex(-1, payload)
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ESCAPE_COMMAND,
        (payload) => {
          payload.preventDefault()
          payload.stopImmediatePropagation()
          closeTypeahead(true)
          return true
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ENTER_COMMAND,
        (payload) => {
          if (options !== null && options.length && selectedIndex !== null) {
            const selection = $getSelection()
            if (!$isRangeSelection(selection)) {
              return false
            }
            const anchor = selection.anchor
            const anchorNode = anchor.getNode()
            const anchorOffset = anchor?.offset - query.length - trigger.length
            let newNode
            if (anchorOffset === 0) {
              ;[newNode] = anchorNode.splitText(anchor?.offset)
            } else {
              ;[, newNode] = anchorNode.splitText(anchorOffset, anchor?.offset)
            }
            if (newNode) {
              newNode.remove()
            }
            options[selectedIndex].command(editor)
            closeTypeahead()
            payload.preventDefault()
            payload.stopImmediatePropagation()
            return true
          }
          return false
        },
        COMMAND_PRIORITY_HIGH
      )
    )
    return () => {
      keyListenerDestroy()
    }
  }, [editor, selectedIndex, options])

  return (
    <div ref={optionsContainerRef} className="virtual-scroll-container">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
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
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            return (
              <TypeaheadMenuComponent
                editor={editor}
                setRef={rowVirtualizer.measureElement}
                key={virtualItem.key}
                index={virtualItem.index}
                options={options}
                selectedIndex={selectedIndex}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export interface TypeaheadChildrenProps<OptionType> {
  editor: LexicalEditor
  trigger: string
  options: OptionType[]
  query: string
  closeTypeahead: (resetPosition?: boolean) => void
}

export function TypeaheadPlugin<OptionType>(props: {
  editor: LexicalEditor
  trigger: string
  getOptions: (query: string) => Promise<OptionType[]>
  Children: (props: TypeaheadChildrenProps<OptionType>) => JSX.Element
}): JSX.Element {
  const [anchorPosition, setAnchorPosition] = useState<Point | null>(null)
  const [isMatch, setIsMatch] = useState(false)
  const [query, setQuery] = useState('')
  const { editor, trigger, getOptions, Children } = props
  const [options, setOptions] = useState<OptionType[]>([])

  // options for menu
  useEffect(() =>{
    getOptions(query).then((options) => setOptions(options))
  }, [editor, query])

  // floating ui hook
  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-start',
    open: isMatch,
    onOpenChange: (open, event) => {
      setIsMatch(open)
    },
    middleware: [offset(6), flip(), shift(), inline()],
    whileElementsMounted: autoUpdate
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })
  const { getFloatingProps } = useInteractions([dismiss, role])

  // popup position update hook
  const updatePopup = useCallback(() => {
    editor.getEditorState().read(() => {
      // Should not to pop up the floating toolbar when using IME input
      if (editor.isComposing()) {
        return
      }
      if (anchorPosition == null) {
        setIsMatch(false)
        setQuery('')
        return
      }

      const node = $getNodeByKey(anchorPosition.key)
      if (node == null) {
        setAnchorPosition(null)
        setIsMatch(false)
        setQuery('')
        return
      }
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        return
      }
      const { anchor, focus } = selection as RangeSelection
      if (anchor.offset != focus.offset) {
        setAnchorPosition(null)
        setIsMatch(false)
        return
      }
      const inputText = node.getTextContent().slice(anchorPosition.offset, focus.offset)
      if (!inputText) {
        setIsMatch(false)
        return
      }

      const regexp = triggerRegexp(trigger)
      const match = Array.from(inputText.matchAll(regexp)).pop()
      // console.log('trigger ', trigger, 'inputText ', inputText, 'match ', match)
      if (!match) {
        setIsMatch(false)
        return
      }
      const matchText = match[0]
      setQuery(matchText.slice(trigger.length))
      setIsMatch(true)

      const nativeSelection = window.getSelection()
      if (nativeSelection != null) {
        const rootElement = editor.getRootElement()
        refs.setReference({
          getBoundingClientRect: () => getDOMRangeRect(nativeSelection, rootElement),
          getClientRects: () => getDOMRangeClientRect(nativeSelection, rootElement)
        })
      }
    })
  }, [editor, anchorPosition])

  // type head match hook
  useEffect(() => {
    // position listener
    const updateChangeListenerDestory = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        if (!editor.isEditable) {
          return
        }
        const currentSelection = $getSelection()
        if (!$isRangeSelection(currentSelection)) {
          return
        }
        const { anchor, focus } = currentSelection as RangeSelection
        if (anchor.offset !== focus.offset) {
          return
        }

        const anchorPoint: Point = {
          key: anchor.key,
          offset: anchor.offset
        }
        // console.log(`----- key: ${anchor.key} offset: ${anchor.offset} -----`)
        if (anchorPosition == null) {
          setAnchorPosition(anchorPoint)
          return
        }
        // node chnage
        if (anchorPosition.key !== anchor.key) {
          const pre = $getNodeByKey(anchorPosition.key)
          const curr = $getNodeByKey(anchor.key)
          if (pre != null && curr != null && curr.getParent() === pre) {
            return
          }
          // setAnchorPosition(anchor)
          setAnchorPosition(anchorPoint)
          return
        }

        // move forward
        if (anchorPosition.offset > anchor.offset) {
          setAnchorPosition(anchorPoint)
          return
        }
      })
    })

    // match
    const textContentChangeListenerDestroy = editor.registerTextContentListener(() => {
      editor.getEditorState().read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return
        }
        const { anchor, focus } = selection as RangeSelection
        if (anchor.offset != focus.offset) {
          return
        }
        updatePopup()
      })
    })
    return () => {
      textContentChangeListenerDestroy()
      updateChangeListenerDestory()
    }
  }, [editor, anchorPosition])

  const resetAnchorToCurrentSelection = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        setAnchorPosition(null)
        return
      }
      const { anchor } = selection as RangeSelection
      setAnchorPosition({ key: anchor.key, offset: anchor.offset })
    })
  }
  return (
    <>
      {isMatch && options && options.length > 0 && (
        <FloatingPortal>
          <div
            className="typeahead-container"
            ref={refs.setFloating}
            style={{ ...floatingStyles, overflow: 'hidden' }}
            {...getFloatingProps}
          >
            <Children
              editor={editor}
              options={options}
              query={query}
              trigger={trigger}
              closeTypeahead={(resetPosition) => {
                setIsMatch(false)
                if (resetPosition) {
                  resetAnchorToCurrentSelection()
                }
              }}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
