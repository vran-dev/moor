import React from 'react'
import Tiptap from './components/TiptapEditor'
import { direction } from '@excalidraw/excalidraw/types/ga'

const App: React.FC = () => {
  return (
    <>
      <div className="navbar"></div>
      <div
        style={{
          margin: '0 16px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column'
        }}
        className={'editorContainer'}
      >
        <Tiptap></Tiptap>
      </div>
    </>
  )
}

export default App
