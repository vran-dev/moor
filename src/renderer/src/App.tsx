import React from 'react'
import Tiptap from './components/TiptapEditor'

const App: React.FC = () => {
  return (
    <>
      <div className="navbar"></div>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          height: '100vh',
          width: '100%'
        }}
        className={'editorContainer'}
      >
        <Tiptap></Tiptap>
      </div>
    </>
  )
}

export default App
