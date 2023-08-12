import { createDOMRange, createRectsFromDOMRange } from '@lexical/selection'
import { $getSelection, $isRangeSelection, LexicalEditor } from 'lexical'
import { useCallback, useLayoutEffect, useMemo } from 'react'

export function usePreudoSelection(): [
  (editor: LexicalEditor, className?: string) => void,
  () => void
] {
  const selectionState = useMemo(
    () => ({
      container: document.createElement('div'),
      elements: []
    }),
    []
  )

  const updateSelectionState = useCallback((editor: LexicalEditor, className?: string) => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const { anchor, focus } = selection
        const range = createDOMRange(
          editor,
          anchor.getNode(),
          anchor.offset,
          focus.getNode(),
          focus.offset
        )
        if (range !== null) {
          const { left, bottom, width } = range.getBoundingClientRect()
          const selectionRects = createRectsFromDOMRange(editor, range)
          let correctedLeft = selectionRects.length === 1 ? left + width / 2 - 125 : left - 125
          if (correctedLeft < 10) {
            correctedLeft = 10
          }
          const selectionRectsLength = selectionRects.length
          const { container } = selectionState
          const elements: Array<HTMLSpanElement> = selectionState.elements
          const elementsLength = elements.length

          for (let i = 0; i < selectionRectsLength; i++) {
            const selectionRect = selectionRects[i]
            let elem: HTMLSpanElement = elements[i]
            if (elem === undefined) {
              elem = document.createElement('span')
              elements[i] = elem
              container.appendChild(elem)
            }
            const bgColor = `background-color:rgba(255, 212, 0, 0.3);`
            const style = `position:absolute;top:${selectionRect.top}px;left:${selectionRect.left}px;height:${selectionRect.height}px;width:${selectionRect.width}px;pointer-events:none;z-index:5;`
            elem.style.cssText = style + (className ? '' : bgColor)
            if (className) {
              elem.classList.add(className)
            }
          }

          for (let i = elementsLength - 1; i >= selectionRectsLength; i--) {
            const elem = elements[i]
            container.removeChild(elem)
            elements.pop()
          }
        }
      }
    })
  }, [])

  const resetSelectionState = useCallback(() => {
    const { container } = selectionState
    const elements: Array<HTMLSpanElement> = selectionState.elements
    const elementsLength = elements.length
    for (let i = elementsLength - 1; i >= 0; i--) {
      const elem = elements[i]
      container.removeChild(elem)
      elements.pop()
    }
  }, [])

  useLayoutEffect(() => {
    const container = selectionState.container
    const body = document.body
    if (body !== null) {
      body.appendChild(container)
      return () => {
        body.removeChild(container)
      }
    }
    return () => {}
  }, [selectionState.container])
  return [updateSelectionState, resetSelectionState]
}
