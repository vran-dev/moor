/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useRef } from 'react'
import Tiptap from './components/TiptapEditor'
import { Aside } from './components/aside'
import { Tabs } from './components/tabs'

const ipcRenderer = window.electron.ipcRenderer

const App: React.FC = () => {
  const tabsRef = useRef(null)
  const openFile = (filePath) => {
    ipcRenderer.invoke('file-read', filePath).then((result) => {
      tabsRef?.current?.addTabItem({
        title: filePath,
        content: () => {
          return <Tiptap content={result}></Tiptap>
        },
        active: true
      })
      // setFilePath(filePath)
      // setData(result)
    })
  }

  const items = [
    {
      title: 'default',
      content: () => {
        return <Tiptap></Tiptap>
      },
      active: true
    },
    {
      title: 'hello world',
      content: () => {
        return <Tiptap></Tiptap>
      }
    }
  ]
  return (
    <>
      <div className="app">
        <div className="navbar"></div>
        <div className="wrapper">
          <Aside onOpenFile={openFile} />
          <div className="wrapper column">
            <Tabs items={items} ref={tabsRef}></Tabs>
            {/* <div className="header">{filePath}</div> */}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
