import { ReactNode } from 'react'
import './index.css'

export function Button(props: {
  children?: ReactNode | string
  onClick?: (e) => void
  type?: 'text' | 'dark'
  icon?: JSX.Element
  className?: string
  style?: React.CSSProperties
  attributes?: any
}): JSX.Element {
  const { className } = props
  const typeClassName = props.type === 'dark' ? 'dark-button' : 'text-button'
  return (
    <button
      className={typeClassName + ` ${className ? className : ''}`}
      onClick={(e): void => props.onClick?.(e)}
      style={props.style}
      {...props.attributes}
    >
      {props.icon}
      <span>{props.children}</span>
    </button>
  )
}
