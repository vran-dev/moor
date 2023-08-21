import { useCallback, useMemo, useState } from 'react'
import './index.css'
export function useCover(): [JSX.Element, () => void, () => void] {
  const [show, setShow] = useState(false)
  const cover = useMemo(() => {
    return (
      <div
        className="cover-overlay"
        style={{
          display: show ? 'block' : 'none',
          opacity: show ? 1 : 0
        }}
      ></div>
    )
  }, [show])
  const showCover = useCallback((): void => {
    setShow(true)
  }, [])

  const hideCover = useCallback((): void => {
    setShow(false)
  }, [])
  return [cover, showCover, hideCover]
}
