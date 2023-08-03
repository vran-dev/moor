import { useEditor, EditorContent } from '@tiptap/react'

import { useEffect, useState } from 'react'
import { extensions } from '@renderer/extensions/extensions'
import { defualtContent } from './defaultContent'
import { BubbleMenu } from '@renderer/extensions/bubble/bubbleMenu'
import '@renderer/assets/editor.css'

const autoParse = (data?: string): object | string | null => {
  if (!data) {
    return null
  }
  try {
    const json = JSON.parse(data)
    return json
  } catch (err) {
    return data
  }
}

const Tiptap = (props: { content?: string; path?: string; workspace?: string }): JSX.Element => {
  const [data, setData] = useState(autoParse(props.content))
  const [filePath, setFilePath] = useState('')
  const editorAttr = {
    spellcheck: 'false'
  }
  if (props.path) {
    editorAttr['contentFilePath'] = props.path
  }
  if (props.workspace) {
    editorAttr['workspace'] = props.workspace
  }
  const editor = useEditor({
    extensions: extensions,
    content: data ? data : defualtContent,
    editorProps: {
      attributes: editorAttr
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
  const [isEditable, setIsEditable] = useState(true)

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
      <BubbleMenu editor={editor} />
      <div className="editor-view">
        <EditorContent editor={editor} style={{ maxWidth: '70ch' }}/>
      </div>
    </>
  )
}
export default Tiptap
