import './index.css'
export type Direction = 'horizontal' | 'vertical'

export function Divider(props: { direction?: Direction }): JSX.Element {
  return (
    <div
      className={`${props.direction === 'vertical' ? 'divider-vertical' : 'divider-horizontal'}`}
    ></div>
  )
}
