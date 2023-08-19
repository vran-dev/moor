import { useEffect, useRef, useState } from 'react'
import { leftCornerHandle, rightCornerHandle } from './CornerHandle'
import React from 'react'
import { throttle } from 'lodash-es'

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
  initialSize: { width: number; height?: number }
  options?: OptionShape
  onResizing?: (e: MouseEvent, width: number | null, height: number | null) => void
  onResized?: (e: MouseEvent, width: number | null, height: number | null) => void
  children?: React.ReactNode
  attrs?: { [key: string]: any }
}

export interface OptionShape {
  [key: string]: any
}

function calcuateWidthAndHeight(
  aspectRatio: ResizableRatioType,
  handleType: ResizableHandleType,
  startWidth: number,
  startHeight: number,
  diffX: number,
  diffY: number
): [number | null, number | null] {
  let newWidth: number | null = null
  let newHeight: number | null = null
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
        newHeight = startHeight
        break
      case ResizableHandleType.Left:
        newWidth = startWidth - diffX
        newHeight = startHeight
        break
      case ResizableHandleType.Bottom:
        newHeight = startHeight + diffY
        newWidth = startWidth
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
  return [newWidth, newHeight]
}

function getHandleStyle(type: ResizableHandleType): React.CSSProperties[] {
  const defaultWrapperStyle = {
    position: 'absolute',
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: '0'
  }
  let wrapperStyle, innerStyle
  switch (type) {
    case ResizableHandleType.Right:
      wrapperStyle = {
        right: '0px',
        top: '0px',
        height: '100%',
        width: '15px',
        cursor: 'col-resize',
        ...defaultWrapperStyle
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
        cursor: 'col-resize',
        ...defaultWrapperStyle
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
        cursor: 'row-resize',
        ...defaultWrapperStyle
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
        ...defaultWrapperStyle
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
        ...defaultWrapperStyle
      }

      innerStyle = {
        height: '22px',
        width: '22px',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url("data:image/svg+xml,${leftCornerHandle}") `
      }
  }

  return [wrapperStyle, innerStyle]
}

export const ResizableView = (props: ResizableHandleProps): JSX.Element => {
  const resizableViewRef = useRef<HTMLDivElement>(null)
  // handler refs
  const leftHandleRef = useRef<HTMLDivElement>(null)
  const rightHandleRef = useRef<HTMLDivElement>(null)
  const bottomHandleRef = useRef<HTMLDivElement>(null)
  const bottomLeftHandleRef = useRef<HTMLDivElement>(null)
  const bottomRightHandleRef = useRef<HTMLDivElement>(null)

  const aspectRatio = props.aspectRatio || ResizableRatioType.Fixed

  const [isShow, setIsShow] = useState(false)
  const onMouseDown = (e: MouseEvent, type: ResizableHandleType): void => {
    if (!resizableViewRef.current) {
      return
    }
    e.preventDefault()
    setIsShow(true)
    resizableViewRef.current.dataset.dragging = 'false'
    // initialize start point & size
    resizableViewRef.current.style.pointerEvents = 'none'
    const startX = e.pageX
    const startY = e.pageY
    const startWidth = resizableViewRef.current?.getBoundingClientRect().width || 0
    const startHeight = resizableViewRef.current?.getBoundingClientRect().height || 0

    // initialize width & height
    let width: number | null = startWidth
    let height: number | null = startHeight

    const onMouseMove = throttle(
      (e: MouseEvent): void => {
        const currentX = e.pageX
        const currentY = e.pageY
        const diffX = currentX - startX
        const diffY = currentY - startY
        const [newWidth, newHeight] = calcuateWidthAndHeight(
          aspectRatio,
          type,
          startWidth,
          startHeight,
          diffX,
          diffY
        )
        if (resizableViewRef.current) {
          if (newWidth) {
            width = Math.round(newWidth)
            resizableViewRef.current.style.width = `${width}px`
          }
          if (newHeight) {
            height = Math.round(newHeight)
            resizableViewRef.current.style.height = `${height}px`
          }
        }
        width = newWidth
        height = newHeight
        props.onResizing?.(e, width, height)
      },
      180,
      { trailing: false }
    )

    const onMouseUp = (e: MouseEvent): void => {
      e.preventDefault()
      if (resizableViewRef.current) {
        resizableViewRef.current.style.pointerEvents = 'auto'
        resizableViewRef.current.dataset.dragging = 'true'
      }
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      props.onResized?.(e, width, height)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  useEffect(() => {
    const setVisiable = (ele: HTMLDivElement | null, show: boolean): void => {
      if (ele) {
        ele.style.opacity = show ? '1' : '0'
      }
    }
    if (isShow) {
      setVisiable(leftHandleRef.current, true)
      setVisiable(rightHandleRef.current, true)
      if (aspectRatio === ResizableRatioType.Flexible) {
        setVisiable(bottomHandleRef.current, true)
        setVisiable(bottomLeftHandleRef.current, true)
        setVisiable(bottomRightHandleRef.current, true)
      }
    } else {
      setVisiable(leftHandleRef.current, false)
      setVisiable(rightHandleRef.current, false)
      if (aspectRatio === ResizableRatioType.Flexible) {
        setVisiable(bottomHandleRef.current, false)
        setVisiable(bottomLeftHandleRef.current, false)
        setVisiable(bottomRightHandleRef.current, false)
      }
    }
  }, [isShow])

  return (
    <div
      className="resizable-view"
      style={{
        position: 'relative',
        minWidth: '50px',
        verticalAlign: 'bottom',
        display: 'inline-block',
        lineHeight: '0',
        zIndex: 100,
        transition: 'width 0.15s ease-out, height 0.15s ease-out',
        width: `${props.initialSize.width}px`,
        height: `${props.initialSize.height ? props.initialSize.height + 'px' : 'inherit'}`
      }}
      onMouseOver={(): void => setIsShow(true)}
      onMouseOut={(): void => setIsShow(false)}
      ref={resizableViewRef}
      {...props.attrs}
    >
      <div
        style={{
          ...getHandleStyle(ResizableHandleType.Left)[0]
        }}
        ref={leftHandleRef}
        onMouseDown={(e): void => onMouseDown(e, ResizableHandleType.Left)}
      >
        <div
          style={{
            transition: 'opacity 300ms ease-in 0s',
            ...getHandleStyle(ResizableHandleType.Left)[1]
          }}
        ></div>
      </div>
      <div
        style={{
          ...getHandleStyle(ResizableHandleType.Right)[0]
        }}
        ref={rightHandleRef}
        onMouseDown={(e): void => onMouseDown(e, ResizableHandleType.Right)}
      >
        <div
          style={{
            transition: 'opacity 300ms ease-in 0s',
            ...getHandleStyle(ResizableHandleType.Right)[1]
          }}
          draggable="false"
        ></div>
      </div>
      {aspectRatio === ResizableRatioType.Flexible && (
        <>
          <div
            style={{
              ...getHandleStyle(ResizableHandleType.Bottom)[0]
            }}
            ref={bottomHandleRef}
            onMouseDown={(e): void => onMouseDown(e, ResizableHandleType.Bottom)}
          >
            <div
              style={{
                transition: 'opacity 300ms ease-in 0s',
                ...getHandleStyle(ResizableHandleType.Bottom)[1]
              }}
              draggable="false"
            ></div>
          </div>
          <div
            style={{
              ...getHandleStyle(ResizableHandleType.BottomLeft)[0]
            }}
            ref={bottomLeftHandleRef}
            onMouseDown={(e): void => onMouseDown(e, ResizableHandleType.BottomLeft)}
          >
            <div
              style={{
                transition: 'opacity 300ms ease-in 0s',
                ...getHandleStyle(ResizableHandleType.BottomLeft)[1]
              }}
              draggable="false"
            ></div>
          </div>
          <div
            style={{
              ...getHandleStyle(ResizableHandleType.BottomRight)[0]
            }}
            ref={bottomRightHandleRef}
            onMouseDown={(e): void => onMouseDown(e, ResizableHandleType.BottomRight)}
          >
            <div
              style={{
                transition: 'opacity 300ms ease-in 0s',
                ...getHandleStyle(ResizableHandleType.BottomRight)[1]
              }}
              draggable="false"
            ></div>
          </div>
        </>
      )}

      <div
        style={{
          height: '100%',
          width: '100%'
        }}
      >
        {props.children}
      </div>
    </div>
  )
}
