import { forwardRef, useImperativeHandle, useState } from 'react'

export interface TabItemProp {
  key: string
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
      <div className={props.active ? 'tab-content-inner active' : 'tab-content-inner inactive'}>
        {props.content(props)}
      </div>
    </>
  )
}

export const Tabs = forwardRef((props: { items: TabItemProp[] }, ref): JSX.Element => {
  const [items, setItems] = useState(props.items)
  useImperativeHandle(ref, () => ({
    addTabItem(item: TabItemProp): void {
      if (items.findIndex((a) => a.key === item.key) !== -1) {
        // active it
        this.openTabItem(item.key)
        return
      }

      if (item.active) {
        const unactivedItems = items.map((item) => {
          item.active = false
          return item
        })
        setItems([...unactivedItems, item])
      } else {
        const newItems = [...items, item]
        setItems(newItems)
      }
    },

    openTabItem(key: string): void {
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
                className={item.active ? 'tab-header-inner active' : 'tab-header-inner inactive'}
              >
                {item.title}
              </div>
            )
          })}
        </div>
        <div className="tab-content">
          {items.map((item, index) => {
            return <TabItem content={item.content} key={index} active={item.active}></TabItem>
          })}
        </div>
      </div>
    </>
  )
})
Tabs.displayName = 'Tabs'
