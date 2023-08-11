/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
  TextNode
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import './index.css'
import { $createCodeNode } from '@lexical/code'
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND
} from '@lexical/list'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import {
  AiOutlineUnorderedList,
  AiOutlineOrderedList,
  AiOutlineTable,
  AiOutlineCheckSquare,
  AiOutlineCode,
  AiOutlineSmile,
  AiOutlineFontSize
} from 'react-icons/ai'
import { LiaQuoteLeftSolid } from 'react-icons/lia'
import { LuHeading1, LuHeading2, LuHeading3 } from 'react-icons/lu'
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

export class TypeHeadMenu {
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

const ICON_SIZE = 20

const ICON_PROPS = {
  size: ICON_SIZE
}

interface Point {
  key: string
  offset: number
}

export const TypeHeadComponent = (
  editor: LexicalEditor,
  trigger: string,
  getOptions: (query: string) => TypeHeadMenu[]
) => {
  const [anchorPosition, setAnchorPosition] = useState<Point | null>(null)
  const [isMatch, setIsMatch] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  // options for menu
  const options = useMemo(() => {
    return getOptions(query)
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
      setSelectedIndex(0)
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

  // selectedIndx update hook
  useEffect(() => {
    const updateSelectedIndex = (diff: number, event: KeyboardEvent) => {
      if (!isMatch) {
        return false
      }
      if (options !== null && options.length && selectedIndex !== null) {
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
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_UP_COMMAND,
        (payload) => {
          return updateSelectedIndex(-1, payload)
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ESCAPE_COMMAND,
        (payload) => {
          if (!isMatch) {
            return false
          }
          setAnchorPosition(null)
          setIsMatch(false)
          payload.preventDefault()
          payload.stopImmediatePropagation()
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ENTER_COMMAND,
        (payload) => {
          if (!isMatch) {
            return false
          }
          if (options !== null && options.length && selectedIndex !== null) {
            options[selectedIndex].command(editor)
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
            setIsMatch(false)
            setAnchorPosition(null)
            payload.preventDefault()
            payload.stopImmediatePropagation()
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
    return () => {
      keyListenerDestroy()
    }
  }, [editor, selectedIndex, options, isMatch, anchorPosition])

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
  return (
    <>
      {isMatch && options && options.length > 0 && (
        <FloatingPortal>
          <div
            className="context-menu"
            ref={refs.setFloating}
            style={{ ...floatingStyles, overflow: 'hidden' }}
            {...getFloatingProps}
          >
            <div
              ref={optionsContainerRef}
              style={{
                maxHeight: '312px',
                overflowY: 'scroll',
                overflowX: 'hidden',
                paddingLeft: '8px',
                paddingRight: '8px',
                paddingTop: '8px',
                paddingBottom: '8px'
              }}
            >
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
                    const option = options[virtualItem.index]
                    return (
                      <button
                        key={virtualItem.key}
                        data-index={virtualItem.index}
                        ref={rowVirtualizer.measureElement}
                        className={`context-menu-item ${
                          virtualItem.index === selectedIndex ? 'selected' : ''
                        } `}
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
                  })}
                </div>
              </div>
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export const TypeHeadPlugin = (): ReactNode => {
  const [editor] = useLexicalComposerContext()

  const getOptions = (query: string) => {
    const baseOptions: TypeHeadMenu[] = [
      new TypeHeadMenu(
        'Heading 1',
        <LuHeading1 {...ICON_PROPS} />,
        'first level heading',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode(`h1`))
            }
          })
        }
      ),
      new TypeHeadMenu(
        'Heading 2',
        <LuHeading2 {...ICON_PROPS} />,
        'second level heading',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode(`h2`))
            }
          })
        }
      ),
      new TypeHeadMenu(
        'Heading 3',
        <LuHeading3 {...ICON_PROPS} />,
        'third level heading',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode(`h3`))
            }
          })
        }
      ),
      new TypeHeadMenu(
        'Bulleted List',
        <AiOutlineUnorderedList {...ICON_PROPS} />,
        'turn into unsorted list',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      ),
      new TypeHeadMenu(
        'Ordered List',
        <AiOutlineOrderedList {...ICON_PROPS} />,
        'turn into sorted list',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      ),
      new TypeHeadMenu(
        'Table',
        <AiOutlineTable {...ICON_PROPS} />,
        'create simple table',
        (editor: LexicalEditor) => {}
      ),
      new TypeHeadMenu(
        'Task',
        <AiOutlineCheckSquare {...ICON_PROPS} />,
        'tracking todo tasks',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
        }
      ),
      new TypeHeadMenu(
        'Quote',
        <LiaQuoteLeftSolid {...ICON_PROPS} />,
        'quote text',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode())
            }
          })
        }
      ),
      new TypeHeadMenu(
        'Excalidraw',
        <LiaQuoteLeftSolid />,
        'drawing with Excalidraw',
        (editor: LexicalEditor) => {}
      ),
      new TypeHeadMenu(
        'Code Block',
        <AiOutlineCode {...ICON_PROPS} />,
        'create codeblock',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()
  
            if ($isRangeSelection(selection)) {
              if (selection.isCollapsed()) {
                $setBlocksType(selection, () => $createCodeNode())
              } else {
                // Will this ever happen?
                const textContent = selection.getTextContent()
                const codeNode = $createCodeNode()
                selection.insertNodes([codeNode])
                selection.insertRawText(textContent)
              }
            }
          })
        }
      ),
      new TypeHeadMenu(
        'Emoji',
        <AiOutlineSmile {...ICON_PROPS} />,
        'select emoji from picker',
        (editor: LexicalEditor) => {}
      ),
      new TypeHeadMenu(
        'Text',
        <AiOutlineFontSize {...ICON_PROPS} />,
        'plain text',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode())
            }
          })
        }
      )
    ]
    return query
      ? [
          ...baseOptions.filter((option) => {
            const matchByTitle = (): boolean => {
              return new RegExp(query, 'gi').exec(option.title) != null
            }
            const matchByDescription = (): boolean => {
              return new RegExp(query, 'gi').exec(option.description) != null
            }
            const matchByKeywords = (): boolean => {
              if (!option.keywords) {
                return false
              }
              return option.keywords.some((keyword) => new RegExp(query, 'gi').exec(keyword))
            }
            return matchByTitle() || matchByDescription() || matchByKeywords()
          })
        ]
      : baseOptions
  }
  return TypeHeadComponent(editor, '/', getOptions)
}
