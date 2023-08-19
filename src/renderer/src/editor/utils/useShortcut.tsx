import { RefObject, useEffect } from 'react'

type ShortcutMap = {
  [key: string]: (event: KeyboardEvent) => void
}

function useShortcut(elementRef: RefObject<HTMLElement>, shortcutMap: ShortcutMap): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const { key } = event
      if (shortcutMap[key]) {
        shortcutMap[key](event)
      }
    }

    const element = elementRef.current
    if (element) {
      element.addEventListener('keydown', handleKeyDown)
    }

    return (): void => {
      if (element) {
        element.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [elementRef, shortcutMap])
}

export default useShortcut
