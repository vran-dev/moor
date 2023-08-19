import { useState } from 'react'
import './index.css'
import { Button } from '../Button'
export interface ButtonItem {
  label?: string
  icon?: JSX.Element
  onClick?: (e: MouseEvent) => void
}

export function RadioButtonGroup(props: {
  items: Array<ButtonItem>
  defaultActiveIndex: number
}): JSX.Element {
  const [activeIndex, setActiveIndex] = useState(props.defaultActiveIndex)
  const onClick = (e: MouseEvent, child: ButtonItem, index: number): void => {
    setActiveIndex(index)
    child.onClick?.(e)
  }
  return (
    <div className="radio-button-group">
      {props.items.map((child, index) => {
        return (
          <Button
            key={index}
            onClick={(e): void => onClick(e, child, index)}
            type="dark"
            className={`${activeIndex == index ? 'active' : ''}`}
            icon={child.icon}
          >
            {child.label && <span>{child.label}</span>}
          </Button>
        )
      })}
    </div>
  )
}
