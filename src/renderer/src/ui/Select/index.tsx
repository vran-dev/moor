import React, { useEffect, useLayoutEffect, useMemo } from 'react'
import './index.css'
import { AiOutlineDown } from 'react-icons/ai'

export interface SelectOption {
  value: string
  name: string
  icon?: JSX.Element
  onSelect?: () => void
}

export interface SelectProps<T extends SelectOption> {
  options: T[]
  defaultIndex?: number
  filter?: (query: string, option: T) => boolean
  onSelect?: (option: SelectOption) => void
  theme?: 'light' | 'dark'
  className?: string
  mainMinWidth?: string
}

export const updateScrollView = (container: HTMLElement, item: HTMLElement): void => {
  const containerHeight = container.offsetHeight
  const itemHeight = item ? item.offsetHeight : 0

  const top = item.offsetTop
  const bottom = top + itemHeight

  if (top < container.scrollTop) {
    container.scrollTop -= container.scrollTop - top + 5
  } else if (bottom > containerHeight + container.scrollTop) {
    container.scrollTop += bottom - containerHeight - container.scrollTop + 5
  }
}

export function VirtualSelect<T extends SelectOption>(props: SelectProps<T>): JSX.Element {
  const [isActive, setIsActive] = React.useState<boolean>(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const selectContainerRef = React.useRef<HTMLDivElement>(null)
  const selectOptionsRef = React.useRef<HTMLDivElement>(null)
  const [query, setQuery] = React.useState('')
  const { onSelect, defaultIndex, filter } = props

  const options = useMemo(() => {
    if (!isActive) {
      return []
    }
    setActiveIndex(0)
    if (query && query != '' && filter) {
      return props.options.filter((option) => filter(query, option))
    }
    return props.options
  }, [query, isActive])

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
    if (!isActive && inputRef.current) {
      inputRef.current.value = ''
      setQuery('')
    }
  }, [isActive])
  const toggleSelect = (e): void => {
    // focus parent
    if (selectContainerRef.current && selectContainerRef.current.parentElement) {
      selectContainerRef.current.parentElement.focus()
    }
    setIsActive(!isActive)
  }

  const changeActiveIndex = (index): void => {
    setActiveIndex(index)
  }

  const changeDefaultIndex = (option: SelectOption): void => {
    onSelect?.(option)
    setIsActive(false)
  }

  useEffect(() => {
    if (!isActive) {
      return
    }
    const handleKeyDown = (e): void => {
      // arrowkey & enter
      if (e.key == 'ArrowDown') {
        e.preventDefault()
        const newIndex = (activeIndex + 1) % options.length
        changeActiveIndex(newIndex)
        return
      }
      if (e.key == 'ArrowUp') {
        e.preventDefault()
        const newIndex = (activeIndex - 1 + options.length) % options.length
        changeActiveIndex(newIndex)
        return
      }
      if (e.key == 'a' && e.ctrlKey) {
        e.preventDefault()
        if (inputRef.current) {
          inputRef.current.select()
        }
        return
      }
      if (e.key == 'Enter') {
        e.preventDefault()
        if (options.length > 0) {
          changeDefaultIndex(options[activeIndex])
        }
        return
      }
    }

    const hanldeMouseClickNotIn = (e): void => {
      if (!isActive) {
        return
      }
      const current = selectContainerRef.current
      if (current && !current.contains(e.target)) {
        setIsActive(false)
        return
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', hanldeMouseClickNotIn)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', hanldeMouseClickNotIn)
    }
  }, [isActive, activeIndex, selectContainerRef, options])

  useLayoutEffect(() => {
    const selectOptionsContainer = selectOptionsRef.current
    const item = selectOptionsContainer?.children[activeIndex] as HTMLElement
    if (item && selectOptionsContainer) {
      updateScrollView(selectOptionsContainer, item)
    }
  }, [activeIndex])

  const getThemeClassName = (): string => {
    if (props.theme === 'dark') {
      return 'dark'
    }
    return 'light'
  }

  return (
    <div
      className={`select-container ${
        props.className ? props.className : ''
      } ${getThemeClassName()}`}
      onClick={toggleSelect}
      ref={selectContainerRef}
    >
      <div className={`select-header ${getThemeClassName()} ${isActive ? 'active' : ''} `}>
        <span className={`select-header-icon`}>{props.options[defaultIndex || 0]?.icon}</span>
        <span>{props.options[defaultIndex || 0]?.name || ''}</span>
        <button className="select-caret" onClick={toggleSelect}>
          <AiOutlineDown />
        </button>
      </div>
      <div
        className={`select-main ${getThemeClassName()} ${isActive ? 'active' : ''}`}
        style={{
          minWidth: props.mainMinWidth ? props.mainMinWidth : '100%'
        }}
      >
        {props.filter && (
          <div>
            <input
              type="text"
              placeholder={props.options[defaultIndex || 0]?.name || 'type to search'}
              className={`select-input ${getThemeClassName()}`}
              ref={inputRef}
              onClick={(e): void => e.stopPropagation()}
              disabled={filter ? false : true}
              onChange={(e): void => setQuery(e.target.value)}
            />
          </div>
        )}

        <div className={`select-options ${getThemeClassName()}`} ref={selectOptionsRef}>
          {options.map((option, index) => (
            <button
              key={index}
              value={option.value}
              className={`select-option ${getThemeClassName()} ${
                index == activeIndex ? 'active' : ''
              }`}
              onMouseEnter={(): void => changeActiveIndex(index)}
              onClick={(e): void => changeDefaultIndex(option)}
            >
              <span className={`select-option-icon ${getThemeClassName()}`}>
                {option.icon ? option.icon : ''}
              </span>
              <span className={`select-option-name ${getThemeClassName()}`}>{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
