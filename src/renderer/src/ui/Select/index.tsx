import './index.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps<T extends SelectOption> {
  options: T[]
  search?: (query: string) => T[]
  onChange?: (value: string) => void
  placeholder?: string
}

export function Select<T extends SelectOption>(props: SelectProps<T>): JSX.Element {
  return (
    <div className="select-container">
      <input type="text" placeholder={props.placeholder} className="select-container-input" />
      <select>
        {props.options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
