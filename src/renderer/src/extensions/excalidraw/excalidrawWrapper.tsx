import { Excalidraw } from '@excalidraw/excalidraw'
import { NodeViewWrapper } from '@tiptap/react'
import { ReactNode, useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

const ExcalidrawWrapper = (props: {
  width: string | undefined
  height: string | undefined
  content: object | undefined | null
  onChange: (data: object | null) => void
}): ReactNode => {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null)
  const [excalidrawContent, setExcalidrawContent] = useState(null)
  const dataUpdate = (elements, state): void => {
    if (excalidrawAPI) {
      const data = {
        elements: elements,
        appState: state
      }
      setExcalidrawContent(JSON.stringify(data))
      // console.log(props)
      // props.onChange(excalidrawContent)
    }
  }
  return (
    <>
      <NodeViewWrapper
        style={{
          width: props.width ? props.width : '',
          height: props.height ? props.height : '500px'
        }}
        contentEditable={false}
      >
        <Excalidraw
          initialData={props.content}
          onChange={dataUpdate}
          ref={(api): void => setExcalidrawAPI(api)}
        ></Excalidraw>
      </NodeViewWrapper>
    </>
  )
}

export default ExcalidrawWrapper
