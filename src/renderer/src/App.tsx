/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useEffect } from 'react'
import Tiptap from './components/TiptapEditor'
import { Transaction } from 'prosemirror-state'
import { Editor, useEditor } from '@tiptap/react'
import { extensions } from './extensions/extensions'
import { customMarkdownSerializer } from './extensions/markdown/markdownSerializer'

const App: React.FC = () => {
  const ipcRenderer = window.electron.ipcRenderer
  const [data, setData] = React.useState('')
  const [filePath, setFilePath] = React.useState('')
  const openFileDialog = () => {
    ipcRenderer.invoke('open-file-dialog').then((result) => {
      if (!result) {
        return
      }
      const files = result.filePaths
      if (files.length === 0) {
        return
      }
      ipcRenderer.invoke('file-read', files[0]).then((result) => {
        setData(result)
        setFilePath(files[0])
      })
    })
  }

  const editor = useEditor({
    extensions: extensions,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert p-3 bg-white',
        spellcheck: 'false'
      }
    },
    onUpdate(props: { editor: Editor; tr: Transaction }): void {
      if (!filePath) {
        return
      }
      // const state = props.editor.view.state
      // const markdown = customMarkdownSerializer.serialize(state.doc)
      // ipcRenderer.invoke('file-write', filePath, JSON.stringify(editor?.getJSON()))
    }
  })
  const [isEditable, setIsEditable] = React.useState(true)

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable)
    }
  }, [isEditable, editor])

  useEffect(() => {
    let editorData = data
    try {
      const jsonEditorData = JSON.parse(data)
      editorData = jsonEditorData
    } catch (err) {
      editorData = data
    }
    if (editor) {
      editor.commands.setContent(editorData)
    }
  }, [data])
  return (
    <>
      <div className="app">
        <div className="navbar"></div>
        <div className="wrapper">
          <div className="aside">
            <button onClick={openFileDialog}>open file</button>
          </div>
          <div className="wrapper column">
            <div className="header">{filePath}</div>
            <Tiptap editor={editor} setIsEditable={setIsEditable}></Tiptap>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
