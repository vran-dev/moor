/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useVirtualizer } from '@tanstack/react-virtual'
import '@renderer/assets/emoji-picker.css'
import { EmojiData, toTwoDimensional } from './getEmojis'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import { getEmojis } from './getEmojis'
import './index.css'
import {
  LexicalEditor,
  KEY_ARROW_DOWN_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_UP_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_ENTER_COMMAND,
  $getSelection,
  $isRangeSelection,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  $createTextNode
} from 'lexical'
import {
  TypeaheadChildrenProps,
  TypeaheadMenu,
  TypeaheadMenuComponent,
  TypeaheadPlugin
} from '../TypeheadPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'

const exists = (obj: any): boolean => {
  return obj !== null && obj !== undefined
}

const emojiButtonColors = [
  'rgba(155,223,88,.7)',
  'rgba(149,211,254,.7)',
  'rgba(247,233,34,.7)',
  'rgba(238,166,252,.7)',
  'rgba(255,213,143,.7)',
  'rgba(211,209,255,.7)'
]

const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

export function EmojiVirtualTable(props: {
  editor: LexicalEditor
  query: string
  trigger: string
  options: EmojiData[]
  closeTypeahead: (resetPosition?: boolean) => void
}) {
  const emojiPickerContainer = useRef<HTMLDivElement>(null)
  const [selectEmoji, setSelectEmoji] = useState(null)
  const [selectRow, setSelectRow] = useState(0)
  const [selectCol, setSelectCol] = useState(0)
  const [mouseSelectEnabled, settMouseSelectEnabled] = useState(false)

  const numberOfColumns = 10
  const matchedEmojiData = props.options || []
  const flattedEmojiData = matchedEmojiData.flatMap((emojiData) => emojiData.emojis)
  const emojiRows: [][] = toTwoDimensional(flattedEmojiData || [], numberOfColumns)

  const { editor, options, query, trigger, closeTypeahead } = props

  useEffect(() => {
    setSelectEmoji(null)
    setSelectCol(0)
    setSelectRow(0)
  }, [options])

  const rowVirtualizer = useVirtualizer({
    count: emojiRows.length,
    scrollPaddingStart: 12,
    scrollPaddingEnd: 12,
    getScrollElement: () => emojiPickerContainer.current,
    estimateSize: (index) => {
      const item = emojiRows[index]
      if (item) {
        return 36
      }
      return 0
    }
  })
  useEffect(() => {
    if (exists(selectRow) && exists(rowVirtualizer) && emojiRows.length > 0) {
      rowVirtualizer.scrollToIndex(selectRow)
    }
  }, [selectRow])

  useEffect(() => {
    if (exists(selectRow) && exists(selectCol) && emojiRows.length > 0) {
      const emoji = emojiRows[selectRow][selectCol]
      setSelectEmoji(emoji)
    } else {
      setSelectEmoji(null)
    }
  }, [selectRow, selectCol])

  const onClickEmoji = (emoji) => {
    const emojiSkin = emoji.skins[0].native
    const selection = $getSelection()
    if (selection != null) {
      const textNode = $createTextNode(emojiSkin)
      selection?.insertNodes([textNode])
    }
  }

  const onSelectEmoji = (emoji, row, col) => {
    setSelectRow(row)
    setSelectCol(col)
  }

  useEffect(() => {
    const keyListenerDestroy = mergeRegister(
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_DOWN_COMMAND,
        (payload) => {
          payload.preventDefault()
          payload.stopImmediatePropagation()
          setSelectRow((selectRow + 1) % emojiRows.length)
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_UP_COMMAND,
        (payload) => {
          payload.preventDefault()
          payload.stopImmediatePropagation()
          setSelectRow((selectRow - 1 + emojiRows.length) % emojiRows.length)
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_LEFT_COMMAND,
        (payload) => {
          payload.preventDefault()
          payload.stopImmediatePropagation()
          if (selectCol === 0 && selectRow === 0) {
            return true
          }
          if (selectCol === 0) {
            setSelectRow(Math.max(selectRow - 1, 0) % emojiRows.length)
          }
          const currCols = emojiRows[selectRow].length
          setSelectCol((selectCol - 1 + currCols) % currCols)
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_RIGHT_COMMAND,
        (payload) => {
          if (!emojiRows.length) {
            return false
          }
          payload.preventDefault()
          payload.stopImmediatePropagation()
          if (selectCol === emojiRows[selectRow].length - 1) {
            setSelectRow((selectRow + 1) % emojiRows.length)
          }
          const currCols = emojiRows[selectRow].length
          setSelectCol((selectCol + 1) % currCols)
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ESCAPE_COMMAND,
        (payload) => {
          payload.preventDefault()
          payload.stopImmediatePropagation()
          closeTypeahead(true)
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ENTER_COMMAND,
        (payload) => {
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
          onClickEmoji(emojiRows[selectRow][selectCol])
          closeTypeahead()
          payload.preventDefault()
          payload.stopImmediatePropagation()
          return true
        },
        COMMAND_PRIORITY_LOW
      )
    )
    return () => {
      keyListenerDestroy()
    }
  }, [options, selectRow, selectCol])

  return (
    <>
      {emojiRows.length > 0 && (
        <div className="emoji-container" onMouseMove={() => settMouseSelectEnabled(true)}>
          <div className="emoji-picker" ref={emojiPickerContainer}>
            <div
              className="inner"
              style={{
                width: '100%',
                height: `${rowVirtualizer.getTotalSize()}px`
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                return (
                  <div
                    className="row"
                    key={virtualRow.index}
                    style={{
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`
                    }}
                  >
                    {emojiRows[virtualRow.index].map((emoji, colIndex) => {
                      return (
                        <div
                          className="col"
                          key={colIndex}
                          onClick={() => onClickEmoji(emoji)}
                          onMouseOver={() =>
                            mouseSelectEnabled && onSelectEmoji(emoji, virtualRow.index, colIndex)
                          }
                        >
                          <div
                            className={`emoji ${
                              selectRow === virtualRow.index && selectCol === colIndex
                                ? 'selected'
                                : ''
                            }`}
                            style={{
                              backgroundColor:
                                selectRow === virtualRow.index && selectCol === colIndex
                                  ? emojiButtonColors[selectCol % emojiButtonColors.length]
                                  : '',
                              transition: 'background-color 0.2s linear'
                            }}
                          >
                            {virtualRow.index === selectRow && (
                              <span className="indicator">{(colIndex + 1) % numberOfColumns}</span>
                            )}
                            {emoji.skins[0].native}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
          {selectEmoji && <div className="emoji-preview">{selectEmoji.name}</div>}
        </div>
      )}
    </>
  )
}

export function EmojiTypeaheadPlugin() {
  const [editor] = useLexicalComposerContext()

  const getOptions = async (query: string) => {
    return getEmojis({ query })
  }
  return TypeaheadPlugin<EmojiData>({
    editor: editor,
    getOptions: getOptions,
    trigger: ':',
    Children: (props: TypeaheadChildrenProps<EmojiData>) => EmojiVirtualTable(props)
  })
}
