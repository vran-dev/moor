import { Excalidraw, MainMenu } from '@excalidraw/excalidraw'
import { Attrs } from '@tiptap/pm/model'
import { Editor, Node, NodeViewWrapper } from '@tiptap/react'
import { ReactNode, useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

const ExcalidrawWrapper = (props: {
  editor: Editor
  node: Node
  selected: boolean
  getPos: () => number | undefined
  updateAttributes: (attributes: Attrs | null) => void
}): ReactNode => {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null)
  const containerRef = useRef(null)
  const [id, setId] = useState('id_' + uuidv4())
  const dataDragHandleRef = useRef(null)

  const node = props.node
  const attrs = node.attrs
  const width = attrs.width ? attrs.width : '800px'
  const height = attrs.height ? attrs.height : '600px'
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

  const toggleZenMode = (): void => {
    if (excalidrawAPI) {
      excalidrawAPI.getAppState().zenModeEnabled = !excalidrawAPI.getAppState().zenModeEnabled
    }
  }

  const getZenMode = (): boolean => {
    if (excalidrawAPI) {
      return excalidrawAPI.getAppState().zenModeEnabled
    }
    return false
  }
  const toggleGridMode = (): void => {
    if (excalidrawAPI) {
      const gridModeEnabled = excalidrawAPI.getAppState().gridModeEnabled
      if (gridModeEnabled) {
        excalidrawAPI.getAppState().gridModeEnabled = false
        excalidrawAPI.getAppState().gridSize = null
      } else {
        excalidrawAPI.getAppState().gridModeEnabled = true
        excalidrawAPI.getAppState().gridSize = 20
      }
    }
  }
  const getGridMode = (): boolean => {
    if (excalidrawAPI) {
      return excalidrawAPI.getAppState().gridModeEnabled
    }
    return false
  }

  const styleObj = {
    width: '100%',
    height: '100%',
    position: 'relative',
    boxShadow: props.selected
      ? 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px'
      : 'none'
  }

  const dragHandlerStyle = {
    display: props.selected ? 'inherit' : 'none'
  }
  return (
    <>
      <NodeViewWrapper style={styleObj} ref={containerRef} className="not-prose">
        <div
          ref={dataDragHandleRef}
          className="drag-handle"
          contentEditable="false"
          draggable="true"
          data-drag-handle
          style={dragHandlerStyle}
        />
        <div style={{ width: '100%', height: '100%', position: 'relative' }} className="not-prose">
          <Excalidraw
            initialData={initialData}
            onChange={dataUpdate}
            zenModeEnabled={false}
            ref={(api): void => setExcalidrawAPI(api)}
          >
            <MainMenu>
              <MainMenu.Group>
                <MainMenu.DefaultItems.LoadScene />
                <MainMenu.DefaultItems.Export />
                <MainMenu.DefaultItems.SaveAsImage />
                <MainMenu.DefaultItems.Help />
                <MainMenu.DefaultItems.ClearCanvas />
              </MainMenu.Group>
              <MainMenu.Group title={'Panel'}>
                <MainMenu.Item onSelect={toggleZenMode}>
                  Zen Mode {getZenMode() ? '(On)' : '(Off)'}
                </MainMenu.Item>
                <MainMenu.Item onSelect={toggleGridMode}>
                  Grid Mode {getGridMode() ? '(On)' : '(Off)'}
                </MainMenu.Item>
              </MainMenu.Group>
              <MainMenu.Group title={'Theme'}>
                <MainMenu.DefaultItems.ToggleTheme />
                <MainMenu.DefaultItems.ChangeCanvasBackground />
              </MainMenu.Group>
            </MainMenu>
          </Excalidraw>
        </div>
      </NodeViewWrapper>
    </>
  )
}

export default ExcalidrawWrapper
