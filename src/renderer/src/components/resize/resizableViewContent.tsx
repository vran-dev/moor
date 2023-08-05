import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { leftCornerHandle, rightCornerHandle } from './corner-handle'
import React from 'react'
import { throttle } from 'throttle-debounce'

export enum ResizableRatioType {
  Fixed,
  Flexible
}

export enum ResizableHandleType {
  Right,
  Left,
  Bottom,
  BottomRight,
  BottomLeft
}

const MIN_WIDTH = 50

export interface ResizableHandleProps {
  aspectRatio?: ResizableRatioType
  initialSize: { width: number; height: number }
  options?: OptionShape
  onResizing?: (e: MouseEvent, width: number | null, height: number | null) => void
  onResized?: (e: MouseEvent, width: number | null, height: number | null) => void
  children?: React.ReactNode
}

export interface OptionShape {
  [key: string]: any
}

export const ResizableView = (props: ResizableHandleProps): JSX.Element => {
  const handlesRef = useRef<Array<React.RefObject<HTMLDivElement>>>([])
  const resizableViewRef = useRef<HTMLDivElement>(null)
  const resizableElementRef = useRef<HTMLDivElement>(null)
  // const [width, setWidth] = useState<number | null>(props.initialSize.width)
  // const [height, setHeight] = useState<number | null>(props.initialSize.height)

  const aspectRatio = props.aspectRatio || ResizableRatioType.Fixed
  const types =
    aspectRatio === ResizableRatioType.Flexible
      ? [
          ResizableHandleType.Right,
          ResizableHandleType.Left,
          ResizableHandleType.Bottom,
          ResizableHandleType.BottomRight,
          ResizableHandleType.BottomLeft
        ]
      : [ResizableHandleType.Right, ResizableHandleType.Left]

  const setHandleVisibe = (): void => {
    handlesRef.current.forEach((handle) => handle.current.setHandleVisibility(true))
  }
  const setHandleInvisible = (): void => {
    handlesRef.current.forEach((handle) => handle.current.setHandleVisibility(false))
  }

  useLayoutEffect(() => {
    for (const handle of handlesRef.current) {
      const onMouseDown = throttle(200, (e: MouseEvent) => {
        e.preventDefault()
        handle.current?.dataSetDragging(true)
        resizableElementRef.current.style.pointerEvents = 'none'

        const startX = e.pageX
        const startY = e.pageY
        const startWidth = resizableElementRef.current?.getBoundingClientRect().width || 0
        const startHeight = resizableElementRef.current?.getBoundingClientRect().height || 0

        let width: number | null = startWidth
        let height: number | null = startHeight

        const onMouseMove = (e: MouseEvent): void => {
          const currentX = e.pageX
          const currentY = e.pageY
          const diffX = currentX - startX
          const diffY = currentY - startY

          let newWidth: number | null = null
          let newHeight: number | null = null
          const handleType = handle.current.type

          if (aspectRatio === ResizableRatioType.Fixed && startWidth && startHeight) {
            switch (handleType) {
              case ResizableHandleType.Right:
              case ResizableHandleType.BottomRight:
                newWidth = startWidth + diffX
                newHeight = (startHeight / startWidth) * newWidth
                break
              case ResizableHandleType.Left:
              case ResizableHandleType.BottomLeft:
                newWidth = startWidth - diffX
                newHeight = (startHeight / startWidth) * newWidth
                break
              case ResizableHandleType.Bottom:
                newHeight = startHeight + diffY
                newWidth = (startWidth / startHeight) * newHeight
                break
            }
          } else if (aspectRatio === ResizableRatioType.Flexible) {
            switch (handleType) {
              case ResizableHandleType.Right:
                newWidth = startWidth + diffX
                break
              case ResizableHandleType.Left:
                newWidth = startWidth - diffX
                break
              case ResizableHandleType.Bottom:
                newHeight = startHeight + diffY
                break
              case ResizableHandleType.BottomRight:
                newWidth = startWidth + diffX
                newHeight = startHeight + diffY
                break
              case ResizableHandleType.BottomLeft:
                newWidth = startWidth - diffX
                newHeight = startHeight + diffY
                break
            }
          }

          if (typeof newWidth === 'number' && newWidth < MIN_WIDTH) {
            if (aspectRatio === ResizableRatioType.Fixed && startWidth && startHeight) {
              newWidth = MIN_WIDTH
              newHeight = (startHeight / startWidth) * newWidth
            } else if (aspectRatio === ResizableRatioType.Flexible) {
              newWidth = MIN_WIDTH
            }
          }

          if (newWidth) {
            width = Math.round(newWidth)
            resizableViewRef.current.style.width = `${width}px`
          }

          if (newHeight) {
            height = Math.round(newHeight)
            if (aspectRatio === ResizableRatioType.Flexible) {
              resizableViewRef.current.style.height = `${height}px`
            }
          }

          if (newWidth || newHeight) {
            resizableViewRef.current.style.aspectRatio = `${width} / ${height}`
          }
          width = newWidth
          height = newHeight
          props.onResizing?.(e, width, height)
        }

        const onMouseUp = (e: MouseEvent): void => {
          e.preventDefault()
          handle.current?.dataSetDragging(false)
          handle.current?.setHandleVisibility(false)
          resizableElementRef.current.style.pointerEvents = 'auto'

          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
          props.onResized?.(e, width, height)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        // this.#destroyList.push(() => document.removeEventListener('mousemove', onMouseMove))
        // this.#destroyList.push(() => document.removeEventListener('mouseup', onMouseUp))
      })
      handle.current?.addEventListener('mousedown', (e) => onMouseDown(e))
      // this.#destroyList.push(() => handle.dom.removeEventListener('mousedown', onMouseDown))
    }
  })

  return (
    <div
      className="resizable-view"
      style={{
        position: 'relative',
        maxWidth: '100%',
        minWidth: '50px',
        verticalAlign: 'bottom',
        display: 'inline-block',
        lineHeight: '0',
        transition: 'width 0.15s ease-out, height 0.15s ease-out',
        width: `${props.initialSize.width}px`,
        height: `${props.initialSize.height}px`
      }}
      onMouseOver={(): void => setHandleVisibe()}
      onMouseOut={(): void => setHandleInvisible()}
      ref={resizableViewRef}
    >
      {types.map((type, index) => {
        const handleRef = useRef(null)
        handlesRef.current[index] = handleRef
        return <ResizableViewHandle type={type} key={index} ref={handleRef}></ResizableViewHandle>
      })}
      <div ref={resizableElementRef} style={{ width: '100%', height: '100%' }}>
        {props.children}
      </div>
    </div>
  )
}

const ResizableViewHandle = forwardRef((props: { type: ResizableHandleType }, ref): JSX.Element => {
  const handleRef = useRef<HTMLDivElement>(null)
  const handleWrapperRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => {
    return {
      setHandleVisibility(visible: boolean): void {
        if (!handleRef.current) return
        const isVisible = visible || !!handleRef.current.dataset.dragging
        handleRef.current.style.opacity = isVisible ? '1' : '0'
      },
      dataSetDragging(isDragging: boolean): void {
        if (!handleRef.current) return
        handleRef.current.dataset.dragging = isDragging ? 'true' : ''
      },
      addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
        if (!handleWrapperRef.current) return
        handleWrapperRef.current.addEventListener(type, listener)
      },
      type: props.type
    }
  })

  let wrapperStyle, innerStyle
  switch (props.type) {
    case ResizableHandleType.Right:
      wrapperStyle = {
        right: '0px',
        top: '0px',
        height: '100%',
        width: '15px',
        cursor: 'col-resize'
      }

      innerStyle = {
        width: ' 4px',
        height: '36px',
        maxHeight: '50%',
        boxSizing: 'content-box',
        background: 'rgba(0, 0, 0, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '6px'
      }

      break
    case ResizableHandleType.Left:
      wrapperStyle = {
        left: '0px',
        top: '0px',
        height: '100%',
        width: '15px',
        cursor: 'col-resize'
      }

      innerStyle = {
        width: ' 4px',
        height: '36px',
        maxHeight: '50%',
        boxSizing: 'content-box',
        background: 'rgba(0, 0, 0, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '6px'
      }

      break
    case ResizableHandleType.Bottom:
      wrapperStyle = {
        bottom: '0px',
        width: '100%',
        height: '14px',
        cursor: 'row-resize'
      }

      innerStyle = {
        width: ' 42px',
        height: '4px',
        boxSizing: 'content-box',
        maxWidth: '50%',
        background: 'rgba(0, 0, 0, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '6px'
      }

      break
    case ResizableHandleType.BottomRight:
      wrapperStyle = {
        right: '-1px',
        bottom: '-2px',
        width: '30px',
        height: '30px',
        cursor: 'nwse-resize',
        zIndex: '101'
      }

      innerStyle = {
        height: '22px',
        width: '22px',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url("data:image/svg+xml,${rightCornerHandle}") `
      }

      break
    case ResizableHandleType.BottomLeft:
      wrapperStyle = {
        left: '-1px',
        bottom: '-2px',
        width: '30px',
        height: '30px',
        cursor: 'nesw-resize',
        zIndex: '101'
      }

      innerStyle = {
        height: '22px',
        width: '22px',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url("data:image/svg+xml,${leftCornerHandle}") `
      }
  }
  return (
    <div
      style={{
        position: 'absolute',
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '100',
        ...wrapperStyle
      }}
      ref={handleWrapperRef}
    >
      <div
        style={{ opacity: '0', transition: 'opacity 300ms ease-in 0s', ...innerStyle }}
        ref={handleRef}
      ></div>
    </div>
  )
})

ResizableViewHandle.displayName = 'ResizableViewHandle'
