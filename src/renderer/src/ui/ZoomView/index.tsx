import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import './index.css'
import { LuCopy } from 'react-icons/lu'
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai'
import { MdOutlineFitScreen } from 'react-icons/md'

const maxScale = 5
const minScale = 0.1

export function useZoomablePreview(): [
  modal: JSX.Element,
  showPreviewModal: (
    // eslint-disable-next-line no-shadow
    getContent: () => JSX.Element
  ) => void,
  fitScreen: () => void
] {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const modalMenuContainerRef = useRef<HTMLDivElement | null>(null)
  const [modalContent, setModalContent] = useState<null | JSX.Element>(null)
  const [isShow, setIsShow] = useState(false)
  const [scale, setScale] = useState(1)
  const onWheel = useCallback(
    (event: WheelEvent) => {
      if (contentRef.current) {
        const zoomFactor = 0.05 // scale factor
        // 根据滚轮事件的delta值确定放大还是缩小
        const newScale = event.deltaY < 0 ? scale + zoomFactor : scale - zoomFactor
        // limit max and min
        if (newScale >= minScale && newScale <= maxScale) {
          setScale(newScale)
        }
      }
    },
    [contentRef, scale]
  )

  const onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isShow) {
        setIsShow(false)
        if (contentRef.current) {
          contentRef.current.style.transform = `scale(1)`
        }
      }
    },
    [isShow, contentRef]
  )

  const onClickOutsideContent = useCallback(
    (event: MouseEvent) => {
      if (isShow) {
        if (contentRef.current && contentRef.current.contains(event.target as Node)) {
          return
        }
        if (
          modalMenuContainerRef.current &&
          modalMenuContainerRef.current.contains(event.target as Node)
        ) {
          return
        }
        setIsShow(false)
      }
    },
    [contentRef, modalMenuContainerRef, isShow]
  )

  useEffect(() => {
    if (isShow) {
      document.addEventListener('keydown', onEscape)
      window.addEventListener('resize', fitScreen)
      return () => {
        document.removeEventListener('keydown', onEscape)
        window.removeEventListener('resize', fitScreen)
      }
    } else {
      setModalContent(null)
    }
  }, [isShow])

  useEffect(() => {
    if (contentRef.current) {
      if (isShow) {
        contentRef.current.style.transform = `scale(${scale})`
      } else {
        contentRef.current.style.transform = `scale(1)`
      }
    }
  }, [isShow, scale])

  const fitScreen = useCallback(() => {
    if (contentRef.current) {
      // get actual width and height
      const width = contentRef.current.offsetWidth
      const height = contentRef.current.offsetHeight
      // fit to screen
      const scale = Math.min(
        (window.innerWidth - 200) / width,
        (window.innerHeight - 200) / height,
        maxScale
      )
      setScale(scale)
    }
  }, [contentRef])

  const showModal = useCallback(
    (
      // eslint-disable-next-line no-shadow
      getContent: () => JSX.Element
    ) => {
      setModalContent(getContent())
      setIsShow(true)
    },
    [modalContent]
  )

  const iconProps = { size: 14 }
  return [
    <div
      className="zoom-modal"
      onWheel={(event: WheelEvent): void => {
        onWheel(event)
      }}
      ref={modalRef}
      style={{
        display: isShow ? 'block' : 'none'
      }}
      onClick={(event: MouseEvent): void => {
        onClickOutsideContent(event)
      }}
    >
      <div className="zoom-modal-container">
        <div className="zoom-modal-content" ref={contentRef}>
          {modalContent}
        </div>
        <div className="zoom-modal-menus" ref={modalMenuContainerRef}>
          <button className="zoom-modal-menu-item" onClick={fitScreen}>
            <MdOutlineFitScreen {...iconProps} />
          </button>
          {/* <button className="zoom-modal-menu-item">
            <LuCopy {...iconProps}/>
          </button> */}
          <button
            className="zoom-modal-menu-item"
            onClick={(): void => setScale(Math.max(minScale, scale - 0.1))}
          >
            <AiOutlineMinus {...iconProps} />
          </button>
          <button className="zoom-modal-menu-item" onClick={(): void => setScale(1)}>
            <span>{Math.round(scale * 100)}%</span>
          </button>
          <button
            className="zoom-modal-menu-item"
            onClick={(): void => setScale(Math.min(maxScale, scale + 0.1))}
          >
            <AiOutlinePlus {...iconProps} />
          </button>
        </div>
      </div>
    </div>,
    showModal,
    fitScreen
  ]
}
