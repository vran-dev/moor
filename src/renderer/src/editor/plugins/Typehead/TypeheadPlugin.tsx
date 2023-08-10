/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
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
import { PointType } from 'lexical/LexicalSelection'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

export class SlashMenuItem {
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

export const TypeHeadComponent = (editor: LexicalEditor) => {
  const [anchorPosition, setAnchorPosition] = useState<PointType | null>(null)
  const [headPosition, setHeadPosition] = useState<PointType | null>(null)
  const [isMatch, setIsMatch] = useState(false)
  const [trigger, setTrigger] = useState('/')
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0)

  // options for menu
  const options = useMemo(() => {
    const baseOptions: SlashMenuItem[] = [
      new SlashMenuItem(
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
      new SlashMenuItem(
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
      new SlashMenuItem(
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
      new SlashMenuItem(
        'Bulleted List',
        <AiOutlineUnorderedList {...ICON_PROPS} />,
        'turn into unsorted list',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      ),
      new SlashMenuItem(
        'Ordered List',
        <AiOutlineOrderedList {...ICON_PROPS} />,
        'turn into sorted list',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      ),
      new SlashMenuItem(
        'Table',
        <AiOutlineTable {...ICON_PROPS} />,
        'create simple table',
        (editor: LexicalEditor) => {}
      ),
      new SlashMenuItem(
        'Task',
        <AiOutlineCheckSquare {...ICON_PROPS} />,
        'tracking todo tasks',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
        }
      ),
      new SlashMenuItem(
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
      new SlashMenuItem(
        'Excalidraw',
        <LiaQuoteLeftSolid />,
        'drawing with Excalidraw',
        (editor: LexicalEditor) => {}
      ),
      new SlashMenuItem(
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
      new SlashMenuItem(
        'Emoji',
        <AiOutlineSmile {...ICON_PROPS} />,
        'select emoji from picker',
        (editor: LexicalEditor) => {}
      ),
      new SlashMenuItem(
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
      const nativeSelection = window.getSelection()
      if (nativeSelection != null) {
        const rootElement = editor.getRootElement()
        refs.setReference({
          getBoundingClientRect: () => getDOMRangeRect(nativeSelection, rootElement),
          getClientRects: () => getDOMRangeClientRect(nativeSelection, rootElement)
        })
      }
    })
  }, [editor, isMatch, query])

  // type head match hook
  useEffect(() => {
    const removeTransform = editor.registerNodeTransform(TextNode, (textNode) => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        return
      }
      const { anchor, focus } = selection as RangeSelection
      if (anchor.offset != focus.offset) {
        return
      }
      setHeadPosition(focus)
      const inputText = anchorPosition
        ?.getNode()
        .getTextContent()
        .slice(anchorPosition.offset, focus.offset)
      if (!inputText) {
        setIsMatch(false)
        return
      }

      const regexp = triggerRegexp(trigger)
      const match = Array.from(inputText.matchAll(regexp)).pop()
      console.log('trigger ', trigger, 'inputText ', inputText, 'match ', match)
      if (!match) {
        setIsMatch(false)
        return
      }
      updatePopup()
      const index = match.index
      const matchText = match[0]
      setQuery(matchText.slice(trigger.length))
      setIsMatch(true)
    })

    // position listener
    const removeListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (payload, editor) => {
        const currentSelection = $getSelection()
        if (!$isRangeSelection(currentSelection)) {
          return false
        }
        const { anchor, focus } = currentSelection as RangeSelection
        if (anchor.offset !== focus.offset) {
          return false
        }

        if (anchorPosition == null) {
          setAnchorPosition(anchor)
          setHeadPosition(focus)
          return false
          // console.log('update position by initialize, ', anchor)
        }
        // node chnage
        if (anchorPosition.key !== anchor.key) {
          setAnchorPosition(anchor)
          setHeadPosition(focus)
          // console.log('update position by node change, ', anchor)
          setIsMatch(false)
          return false
        }

        // move forward
        if (anchorPosition.offset > anchor.offset) {
          setAnchorPosition(anchor)
          setHeadPosition(focus)
          // console.log('update position by move forward, ', anchor)
          setIsMatch(false)
          return false
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    )
    return () => {
      removeTransform()
      removeListener()
    }
  }, [editor, anchorPosition, updatePopup, isMatch])

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

    const listenerPostProcess = mergeRegister(
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
          setHeadPosition(null)
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
            const anchor = selection.anchor
            const anchorNode = anchor.getNode()
            const anchorOffset = headPosition?.offset - query.length - trigger.length
            let newNode
            if (anchorPosition?.offset === 0) {
              ;[newNode] = anchorNode.splitText(headPosition?.offset)
            } else {
              ;[, newNode] = anchorNode.splitText(anchorOffset, headPosition?.offset)
            }
            console.log('...................................')
            console.log(newNode)
            if (newNode) {
              newNode.remove()
            }
            setIsMatch(false)
            setAnchorPosition(null)
            setHeadPosition(null)
            payload.preventDefault()
            payload.stopImmediatePropagation()
          }
          return true
        },
        COMMAND_PRIORITY_LOW
      )
    )
    return () => {
      listenerPostProcess()
    }
  }, [editor, selectedIndex, options, isMatch])

  return (
    <>
      {isMatch && (
        <FloatingPortal>
          <div
            className="context-menu"
            ref={refs.setFloating}
            style={{ ...floatingStyles }}
            {...getFloatingProps}
          >
            <div>
              {options.map((option, i: number) => (
                <button
                  key={i}
                  data-index={i}
                  className={`context-menu-item ${i === selectedIndex ? 'selected' : ''} `}
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
              ))}
            </div>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export const TypeHeadPlugin = (): ReactNode => {
  const [editor] = useLexicalComposerContext()
  return TypeHeadComponent(editor)
}
