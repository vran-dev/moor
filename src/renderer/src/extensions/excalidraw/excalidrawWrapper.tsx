import { Excalidraw } from '@excalidraw/excalidraw'
import { Attrs } from '@tiptap/pm/model'
import { Editor, Node, NodeViewWrapper } from '@tiptap/react'
import { ReactNode, useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

const ExcalidrawWrapper = (props: {
  editor: Editor
  node: Node
  updateAttributes: (attributes: Attrs | null) => void
}): ReactNode => {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null)
  const node = props.node
  const attrs = node.attrs
  const width = attrs.width ? attrs.width : ''
  const height = attrs.height ? attrs.height : '500px'
  const initialData = attrs.data ? JSON.parse(attrs.data) : null
  const dataUpdate = (elements, state, files): void => {
    // notice: state.collaborators should be a array ,but export to object
    state.collaborators = []
    const data = {
      elements: elements,
      appState: state,
      files: files
    }
    const newData = JSON.stringify(data)
    Promise.resolve().then(() => {
      props.updateAttributes({ data: newData })
    })
  }
  return (
    <>
      <NodeViewWrapper
        style={{
          width: width,
          height: height,
          display: 'block'
        }}
      >
        <Excalidraw
          initialData={initialData}
          onChange={dataUpdate}
          zenModeEnabled={false}
          ref={(api): void => setExcalidrawAPI(api)}
        ></Excalidraw>
      </NodeViewWrapper>
    </>
  )
}

export default ExcalidrawWrapper
