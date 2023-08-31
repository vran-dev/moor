import { SelectOption, VirtualSelect } from '@renderer/ui/Select'
import { useMemo } from 'react'
import { BiCodeCurly } from 'react-icons/bi'
import { PiPresentationChartLight } from 'react-icons/pi'
import { VscSplitVertical } from 'react-icons/vsc'

export function LayoutSelect(props: {
    onChange: (option: SelectOption) => void
    layout: string
}): JSX.Element {
    const options = useMemo(() => {
        const iconProps = {
            size: 12
        }
        return [
            {
                name: 'Code',
                value: 'Code',
                icon: <BiCodeCurly {...iconProps} />
            },
            {
                name: 'Preview',
                value: 'Preview',
                icon: <PiPresentationChartLight {...iconProps} />
            },
            {
                name: 'Split vertical',
                value: 'SplitVertical',
                icon: <VscSplitVertical {...iconProps} />
            }
        ]
    }, [])

    const defaultIndex = useMemo(() => {
        const index = options.findIndex((item) => item.value === props.layout)
        return index === -1 ? 2 : index
    }, [props.layout])

    return (
        <VirtualSelect
            options={options}
            defaultIndex={defaultIndex}
            onSelect={(option): void => props.onChange(option)}
            mainMinWidth="150px"
        />
    )
}
