import { ReactNode } from 'react'
import './index.css'

export function Button(props: {
  children: ReactNode | string
  onClick: (e) => void
  attributes?: any
}): JSX.Element {
  return (
    <button className="text-button" onClick={(e): void => props.onClick(e)} {...props.attributes}>
      {props.children}
    </button>
  )
}
