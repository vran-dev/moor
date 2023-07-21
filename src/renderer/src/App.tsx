/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useRef } from 'react'
import Tiptap from './components/TiptapEditor'
import { Aside, FileInfo } from './components/aside'
import { Tabs } from './components/tabs'

const ipcRenderer = window.electron.ipcRenderer

const App: React.FC = () => {
  const tabsRef = useRef(null)
  const openFile = (fileInfo: FileInfo) => {
    ipcRenderer.invoke('file-read', fileInfo.path).then((result) => {
      tabsRef?.current?.addTabItem({
        key: fileInfo.path,
        title: fileInfo.name,
        content: () => {
          return <Tiptap content={result}></Tiptap>
        },
        active: true
      })
      // setFilePath(filePath)
      // setData(result)
    })
  }

  const items = []
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
