import React from 'react'
import Tiptap from './components/TiptapEditor'

const App: React.FC = () => {
  return (
    <>
      <div className="navbar"></div>
      <div style={{ margin: '0 16px', backgroundColor: '#FFFFFF' }} className={'editorContainer'}>
        <Tiptap></Tiptap>
      </div>
    </>
  )
}

export default App
