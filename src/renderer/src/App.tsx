/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useRef, useState } from 'react'
import Tiptap from './components/TiptapEditor'
import { Aside, FileInfo } from './components/aside'
// import { Tabs } from './components/tabs'
import { DefaultTab } from './components/defaultTab'
import { v4 as uuidv4 } from 'uuid'
import { Tabs } from 'antd'

const ipcRenderer = window.electron.ipcRenderer

const defaultTabStyle = { height: '100%' }

const App: React.FC = () => {
  const [items, setItems] = useState([])
  const [activeKey, setActiveKey] = useState('')
  const openFile = (fileInfo: FileInfo) => {
    if (fileInfo.isDirectory) {
      return
    }
    const targetIndex = items.findIndex((pane) => pane.path === fileInfo.path)
    if (targetIndex >= 0) {
      setActiveKey(items[targetIndex].key)
      return
    }

    ipcRenderer.invoke('file-read', fileInfo.path).then((result) => {
      const newTab = {
        key: uuidv4(),
        path: fileInfo.path,
        label: fileInfo.name,
        children: (
          <Tiptap content={result} path={fileInfo.path} workspace={fileInfo.workspace}></Tiptap>
        ),
        style: { height: '100%'}
      }
      setItems([...items, newTab])
      setActiveKey(newTab.key)
      // setFilePath(filePath)
      // setData(result)
    })
  }

  const createEmptyPage = () => {
    const newPage = {
      key: uuidv4(),
      label: 'New Tab',
      children: <Tiptap></Tiptap>,
      style: defaultTabStyle
    }
    setItems([...items, newPage])
    setActiveKey(newPage.key)
  }

  useEffect(() => {
    if (!items.length) {
      const emptyItem = {
        key: uuidv4(),
        label: 'New Tab',
        children: <DefaultTab createPage={createEmptyPage} />,
        style: defaultTabStyle
      }
      setItems([...items, emptyItem])
      setActiveKey(emptyItem.key)
    }
  }, [])

  const onChange = (key: string) => {
    setActiveKey(key)
  }

  const remove = (targetKey: TargetKey) => {
    const targetIndex = items.findIndex((pane) => pane.key === targetKey)
    const newPanes = items.filter((pane) => pane.key !== targetKey)
    if (newPanes.length && targetKey === activeKey) {
      const { key } = newPanes[targetIndex === newPanes.length ? targetIndex - 1 : targetIndex]
      setActiveKey(key)
    }
    setItems(newPanes)
  }

  const onEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: 'add' | 'remove'
  ) => {
    if (action === 'add') {
      createEmptyPage()
    } else {
      remove(targetKey)
    }
  }

  return (
    <>
      <div className="app">
        <div className="navbar"></div>
        <div className="wrapper">
          <Aside onOpenFile={openFile} />
          <div className="wrapper column">
            <Tabs
              type="editable-card"
              items={items}
              onChange={onChange}
              onEdit={onEdit}
              activeKey={activeKey}
              style={{ height: '100%' }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
