import { forwardRef, useImperativeHandle, useState } from 'react'

export interface TabItem {
  key?: string
  title: string
  content: (item: any) => JSX.Element
  active?: boolean
}

export const TabItem = (props: {
  content: (props: any) => JSX.Element
  active?: boolean
}): JSX.Element => {
  return (
    <>
      <div style={{ display: props.active ? 'static' : 'none' }}>{props.content(props)}</div>
    </>
  )
}

export const Tabs = forwardRef((props: { items: TabItem[] }, ref): JSX.Element => {
  const [items, setItems] = useState(props.items)
  useImperativeHandle(ref, () => ({
    addTabItem(item: TabItem): void {
      if (item.active) {
        const newItems = items.map((i) => {
          i.active = false
          return i
        })
        setItems([...newItems, item])
      } else {
        setItems([...items, item])
      }
    }
  }))
  const openTab = (key: string | number) => () => {
    const newItems = items.map((item) => {
      if (item.key === key) {
        item.active = true
      } else {
        item.active = false
      }
      return item
    })
    setItems(newItems)
  }
  return (
    <>
      <div className="tabs">
        <div className="tab-header">
          {items.map((item, index) => {
            return (
              <div
                key={index}
                onClick={openTab(item.key ? item.key : index)}
                className="tab-item-header"
              >
                {item.title}
              </div>
            )
          })}
        </div>
        <div className="tab-content wrapper column">
          {items.map((item, index) => {
            return <TabItem content={item.content} key={index} active={item.active}></TabItem>
          })}
        </div>
      </div>
    </>
  )
})
Tabs.displayName = 'Tabs'
