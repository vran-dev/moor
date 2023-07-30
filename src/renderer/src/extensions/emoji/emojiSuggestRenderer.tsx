/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Editor, ReactRenderer } from '@tiptap/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import tippy from 'tippy.js'
import '@renderer/assets/emoji-picker.css'
import { toTwoDimensional } from './arrays'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { EmojiData } from './suggestEmojis'

const isNotBlank = (str: string): boolean => {
  return str !== null && str !== undefined && str !== ''
}

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

export const EmojiComponentRef = forwardRef((props: any, ref): JSX.Element => {
  const emojiPickerContainer = useRef<HTMLDivElement>(null)
  const [selectEmoji, setSelectEmoji] = useState(null)
  const [selectRow, setSelectRow] = useState(0)
  const [selectCol, setSelectCol] = useState(0)

  const numberOfColumns = 10
  const matchedEmojiData = (props.items as EmojiData[]) || []
  const flattedEmojiData = matchedEmojiData.flatMap((emojiData) => emojiData.emojis)
  const emojiRows: [][] = toTwoDimensional(flattedEmojiData || [], numberOfColumns)

  useEffect(() => {
    setSelectCol(0)
    setSelectRow(0)
  }, [props.items])

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

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }): boolean => {
      if (!props.items || props.items.length === 0) return false
      if (event.key === 'ArrowUp') {
        setSelectRow((selectRow - 1 + emojiRows.length) % emojiRows.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectRow((selectRow + 1) % emojiRows.length)
        return true
      }
      if (event.key === 'ArrowLeft') {
        if (selectCol === 0 && selectRow === 0) {
          return true
        }
        if (selectCol === 0) {
          setSelectRow(Math.max(selectRow - 1, 0) % emojiRows.length)
        }
        const currCols = emojiRows[selectRow].length
        setSelectCol((selectCol - 1 + currCols) % currCols)
        return true
      }
      if (event.key === 'ArrowRight') {
        if (selectCol === emojiRows[selectRow].length - 1) {
          setSelectRow((selectRow + 1) % emojiRows.length)
        }
        const currCols = emojiRows[selectRow].length
        setSelectCol((selectCol + 1) % currCols)
        return true
      }
      if (event.key === 'Enter') {
        onClickEmoji(emojiRows[selectRow][selectCol])
        return true
      }
      return false
    },
    onHide: () => {
      // do nothing
      setSelectRow(0)
      setSelectCol(0)
    }
  }))

  useEffect(() => {
    if (selectRow !== undefined && selectRow !== null) {
      rowVirtualizer.scrollToIndex(selectRow)
    }
  }, [selectRow])

  useEffect(() => {
    if (exists(selectRow) && exists(selectCol)) {
      const emoji = emojiRows[selectRow][selectCol]
      setSelectEmoji(emoji)
    }
  }, [selectRow, selectCol])

  const onClickEmoji = (emoji) => {
    const editor: Editor = props.editor
    const range = props.range
    editor.chain().focus().deleteRange(range).run()
    // FIXME make emoji as a inline node
    const tr = editor.state.tr.insertText(emoji.skins[0].native)
    editor.view.dispatch(tr)
  }

  const onSelectEmoji = (emoji, row, col) => {
    setSelectRow(row)
    setSelectCol(col)
  }

  return (
    <>
      <div className="emoji-container">
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
                        onMouseOver={() => onSelectEmoji(emoji, virtualRow.index, colIndex)}
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
    </>
  )
})

EmojiComponentRef.displayName = 'EmojiComponent'

export const EmojiComponent = EmojiComponentRef

export const emojiSuggestRenderer = (): any => {
  let component: ReactRenderer | null = null
  let popup: any | null = null

  return {
    onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
      component = new ReactRenderer(EmojiComponent, {
        props,
        editor: props.editor
      })
      // @ts-ignore
      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => props.editor.view.dom.parentElement,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        onHide(instance) {
          component?.ref?.onHide(instance)
        }
      })
    },

    onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
      if (!popup?.[0].state.isShown) {
        return
      }
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
      if (!popup?.[0].state.isVisible) {
        return false
      }
      return component?.ref?.onKeyDown(props)
    },

    onExit: () => {
      popup?.[0].destroy()
      component?.destroy()
    }
  }
}
