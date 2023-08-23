import { SelectOption, VirtualSelect } from '@renderer/ui/Select'
import { ReactNode, useMemo } from 'react'

export function ColorPicker(props: {
  onChange: (option: SelectOption) => void
  color: string
}): JSX.Element {
  const options = useMemo(() => {
    return [
      {
        value: '#FFFFFF',
        color: '#FFFFFF',
        name: '',
        icon: <ColorIcon color="#FFFFFF" />
      },
      {
        value: '#fbfbfb',
        color: '#fbfbfb',
        name: '',
        icon: <ColorIcon color="#fbfbfb" />
      },
      {
        value: '#86A8E7',
        color: '#86A8E7',
        name: '',
        icon: <ColorIcon color="#86A8E7" />
      },
      {
        value: '#D16BA5',
        color: '#D16BA5',
        name: '',
        icon: <ColorIcon color="#D16BA5" />
      },
      {
        value: '#6299FF',
        color: '#6299FF',
        name: '',
        icon: <ColorIcon color="#6299FF" />
      },
      {
        value: '#22D9AE',
        color: '#22D9AE',
        name: '',
        icon: <ColorIcon color="#22D9AE" />
      },
      {
        value: '#E6A1FF',
        color: '#E6A1FF',
        name: '',
        icon: <ColorIcon color="#E6A1FF" />
      },
      {
        value: '#7445E0',
        color: '#7445E0',
        name: '',
        icon: <ColorIcon color="#7445E0" />
      },
      {
        value: '#dadada',
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
        showName: false,
        showCaret: false
      }}
    />
  )
}

function ColorIcon(props: { color: string }): ReactNode {
  return (
    <div
      style={{
        width: '15px',
        height: '15px',
        borderRadius: '2px',
        border: '1px solid #e5e5e5',
        backgroundColor: props.color
      }}
    ></div>
  )
}
