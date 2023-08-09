import { $getSelection, $isRangeSelection, LexicalEditor } from 'lexical'
import { $patchStyleText } from '@lexical/selection'

export interface BubbleColorMenuItem {
  name: string
  color: string
}

interface ColorSelectorProps {
  editor: LexicalEditor
  className?: string
}

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: 'Default',
    color: ''
  },
  {
    name: 'Red',
    color: '#FF5575'
  },
  {
    name: 'Yellow',
    color: '#FFD36A'
  },
  {
    name: 'Blue',
    color: '#6299FF'
  },
  {
    name: 'Green',
    color: '#22D9AE'
  },
  {
    name: 'Pink',
    color: '#E6A1FF'
  },
  {
    name: 'Purple',
    color: '#7445E0'
  },
  {
    name: 'Gray',
    color: '#dadada'
  },

  {
    name: '#b8e986',
    color: '#b8e986'
  }
]

export const FloatingColorSelector = (props: ColorSelectorProps) => {
  const { editor } = props
  const activeColor = HIGHLIGHT_COLORS[0]
  return (
    <div className={'floating-menu-group'}>
      {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
        <button
          key={index}
          onClick={(): void => {
            if (name == 'Default') {
              editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                  $patchStyleText(selection, {
                    'background-color': null
                  })
                }
              })
            } else {
              editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                  $patchStyleText(selection, {
                    'background-color': color
                  })
                }
              })
            }
          }}
          className="floating-menu circle"
          style={{
            backgroundColor: color
          }}
        >
          {activeColor?.name === name ? 'A' : ''}
        </button>
      ))}
    </div>
  )
}
