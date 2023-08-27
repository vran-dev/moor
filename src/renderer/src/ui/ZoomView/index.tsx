import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import './index.css'
import { LuCopy } from 'react-icons/lu'
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai'

const maxScale = 5
const minScale = 0.1

export function ZoomView(props: { children?: ReactNode }): JSX.Element {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)
  const onWheel = useCallback(
    (event: WheelEvent) => {
      if (contentRef.current) {
        const zoomFactor = 0.1 // 缩放因子

        // 根据滚轮事件的delta值确定放大还是缩小
        const newScale = event.deltaY < 0 ? scale + zoomFactor : scale - zoomFactor
        // 限制缩放级别在最小值和最大值之间
        if (newScale >= minScale && newScale <= maxScale) {
          setScale(newScale)
        }
      }
    },
    [contentRef, scale]
  )

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.transform = `scale(${scale})`
    }
  }, [scale])
  return (
    <div
      className="zoom-modal"
      onWheel={(event: WheelEvent): void => {
        onWheel(event)
      }}
    >
      <div className="zoom-modal-container">
        <div className="zoom-modal-content" ref={contentRef}>
          <img src="https://picsum.photos/500/800" />
        </div>
        <div className="zoom-modal-menus">
          <button className="zoom-modal-menu-item">
            <LuCopy />
          </button>
          <button
            className="zoom-modal-menu-item"
            onClick={(): void => setScale(Math.max(minScale, scale - 0.1))}
          >
            <AiOutlineMinus />
          </button>
          <button className="zoom-modal-menu-item" onClick={(): void => setScale(1)}>
            <span>{Math.round(scale * 100)}%</span>
          </button>
          <button
            className="zoom-modal-menu-item"
            onClick={(): void => setScale(Math.min(maxScale, scale + 0.1))}
          >
            <AiOutlinePlus />
          </button>
        </div>
      </div>
    </div>
  )
}
