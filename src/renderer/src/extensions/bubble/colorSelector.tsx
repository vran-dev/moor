/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Editor } from '@tiptap/core'
import { FC } from 'react'

export interface BubbleColorMenuItem {
  name: string
  color: string
}

interface ColorSelectorProps {
  editor: Editor
  className?: string
}

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: 'Default',
    color: ''
  },
  {
    name: 'Yellow',
    color: '#fafaa8'
  },
  {
    name: 'Pink',
    color: '#f8d6d6'
  },
  {
    name: 'Blue',
    color: '#e4f3fa'
  },
  {
    name: 'Gray',
    color: '#dadada'
  }
]

export const ColorSelector: FC<ColorSelectorProps> = ({ editor, className }) => {
  const activeHighlightItem =
    HIGHLIGHT_COLORS.find(({ color }) => editor.isActive('highlight', { color: color })) ||
    HIGHLIGHT_COLORS[0]
  return (
    <div className={className}>
      {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
        <button
          key={index}
          onClick={() => {
            if (name == 'Default') {
              editor.commands.unsetHighlight()
            } else {
              editor.commands.setHighlight({ color })
            }
          }}
          className="color-item"
        >
          <div
            className="inner"
            style={{
              backgroundColor: color
            }}
          >
            {activeHighlightItem?.name === name ? 'A' : ''}
          </div>
        </button>
      ))}
    </div>
  )
}
