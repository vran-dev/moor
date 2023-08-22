import { SelectOption, VirtualSelect } from '@renderer/ui/Select'
import { ReactNode, useMemo } from 'react'

export function ColorPicker(props: {
  onChange: (option: SelectOption) => void
  color: string
}): JSX.Element {
  const options = useMemo(() => {
    return [
      {
        value: '#fbfbfb',
        color: '#fbfbfb',
        name: '',
        icon: <ColorIcon color="#fbfbfb" />
      },
      {
        value: 'Red',
        color: '#FF5575',
        name: '',
        icon: <ColorIcon color="#FF5575" />
      },
      {
        value: 'Yellow',
        color: '#FFD36A',
        name: '',
        icon: <ColorIcon color="#FFD36A" />
      },
      {
        value: 'Blue',
        color: '#6299FF',
        name: '',
        icon: <ColorIcon color="#6299FF" />
      },
      {
        value: 'Green',
        color: '#22D9AE',
        name: '',
        icon: <ColorIcon color="#22D9AE" />
      },
      {
        value: 'Pink',
        color: '#E6A1FF',
        name: '',
        icon: <ColorIcon color="#E6A1FF" />
      },
      {
        value: 'Purple',
        color: '#7445E0',
        name: '',
        icon: <ColorIcon color="#7445E0" />
      },
      {
        value: 'Gray',
        color: '#dadada',
        name: '',
        icon: <ColorIcon color="#dadada" />
      },

      {
        value: '#b8e986',
        color: '#b8e986',
        name: '',
        icon: <ColorIcon color="#b8e986" />
      }
    ]
  }, [])

  const defaultIndex = useMemo(() => {
    const index = options.findIndex((item) => item.value === props.color)
    return index === -1 ? 2 : index
  }, [props.color])

  return (
    <VirtualSelect
      options={options}
      defaultIndex={defaultIndex}
      onSelect={(option): void => props.onChange(option)}
      mainMinWidth="50px"
      headerOptions={{
        showName: false
      }}
    />
  )
}

function ColorIcon(props: { color: string }): ReactNode {
  return (
    <div
      style={{
        width: '16px',
        height: '16px',
        borderRadius: '2px',
        backgroundColor: props.color
      }}
    ></div>
  )
}
