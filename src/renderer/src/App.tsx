/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect, useRef, useState } from 'react'
import Tiptap from './components/TiptapEditor'
import { Aside, FileInfo } from './components/aside'
import { Tabs } from './components/tabs'
import { DefaultTab } from './components/defaultTab'
import { v4 as uuidv4 } from 'uuid'

const ipcRenderer = window.electron.ipcRenderer

const App: React.FC = () => {
  const tabsRef = useRef(null)
  const [items, setItems] = useState([])
  const openFile = (fileInfo: FileInfo) => {
    if (fileInfo.isDirectory) {
      return
    }
    ipcRenderer.invoke('file-read', fileInfo.path).then((result) => {
      const newTab = {
        key: fileInfo.path,
        title: fileInfo.name,
        content: () => {
          return <Tiptap content={result} path={fileInfo.path} workspace={fileInfo.workspace}></Tiptap>
        },
        active: true
      }
      tabsRef?.current?.addTabItem(newTab)
      setItems([...items, newTab])
      // setFilePath(filePath)
      // setData(result)
    })
  }

  const createEmptyPage = () => {
    const newPage = {
      key: uuidv4(),
      title: 'New Tab',
      content: () => {
        return <Tiptap></Tiptap>
      },
      active: true
    }
    tabsRef?.current?.addTabItem(newPage)
    setItems([...items, newPage])
  }

  useEffect(() => {
    if (!items.length) {
      const emptyItem = {
        key: 'New Tab',
        title: 'New Tab',
        content: () => {
          return <DefaultTab createPage={createEmptyPage} />
        },
        active: true
      }
      tabsRef?.current?.addTabItem(emptyItem)
      setItems([emptyItem])
    }
  }, [])

  return (
    <>
      <div className="app">
        <div className="navbar"></div>
        <div className="wrapper">
          <Aside onOpenFile={openFile} />
          <div className="wrapper column">
            <Tabs items={items} ref={tabsRef}></Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
