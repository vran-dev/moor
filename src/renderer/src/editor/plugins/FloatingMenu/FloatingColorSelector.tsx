export interface BubbleColorMenuItem {
  name: string
  color: string
}

interface ColorSelectorProps {
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
  },
  {
    name: '#50e3c2',
    color: '#50e3c2'
  },
  {
    name: '#b8e986',
    color: '#b8e986'
  },
  {
    name: '#f5a623',
    color: '#f5a623'
  }
]

export const ColorSelector = (props: ColorSelectorProps) => {
  const { setTextHighlight, removeTextHighlight } = useCommands()
  const attrs = useAttrs()
  const color = attrs.textHighlight()?.highlight
  const activeColor = HIGHLIGHT_COLORS.find(({ color: c }) => c === color) || HIGHLIGHT_COLORS[0]
  return (
    <div className={props.className}>
      {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
        <button
          key={index}
          onClick={() => {
            if (name == 'Default') {
              removeTextHighlight()
            } else {
              setTextHighlight(color)
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
            {activeColor?.name === name ? 'A' : ''}
          </div>
        </button>
      ))}
    </div>
  )
}
