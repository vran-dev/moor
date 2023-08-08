import { Excalidraw, MainMenu } from '@excalidraw/excalidraw'
import { ResizableRatioType, ResizableView } from '@renderer/components/resize/resizableViewContent'
import { ReactNode, useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from 'antd'
import { NodeViewComponentProps } from '@remirror/react'

export const ExcalidrawNodeView = (props: NodeViewComponentProps): ReactNode => {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null)
  const containerRef = useRef(null)
  const [id, setId] = useState('id_' + uuidv4())
  const dataDragHandleRef = useRef(null)

  const node = props.node
  const attrs = node.attrs
  const width = attrs.width ? attrs.width : 800
  const height = attrs.height ? attrs.height : 600
  const readOnly = attrs.readOnly ? attrs.readOnly : false
  const zenMode = attrs.zenMode ? attrs.zenMode : false
  const gridMode = attrs.gridMode ? attrs.gridMode : false
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
      const newStatus = !excalidrawAPI.getAppState().zenModeEnabled
      excalidrawAPI.getAppState().zenModeEnabled = newStatus
      props.updateAttributes({ zenMode: newStatus })
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
        props.updateAttributes({ gridMode: false })
      } else {
        excalidrawAPI.getAppState().gridModeEnabled = true
        excalidrawAPI.getAppState().gridSize = 20
        props.updateAttributes({ gridMode: true })
      }
    }
  }
  const getGridMode = (): boolean => {
    if (excalidrawAPI) {
      return excalidrawAPI.getAppState().gridModeEnabled
    }
    return false
  }

  const toggleReadView = (): void => {
    if (excalidrawAPI) {
      const newStatus = !excalidrawAPI.getAppState().viewModeEnabled
      excalidrawAPI.getAppState().viewModeEnabled = newStatus
      props.updateAttributes({ readOnly: newStatus })
    }
  }

  const getReadView = (): boolean => {
    if (excalidrawAPI) {
      return excalidrawAPI.getAppState().viewModeEnabled
    }
    return false
  }

  const styleObj = {
    position: 'relative',
    height: '100%',
    width: '100%'
  }

  const dragHandlerStyle = {
    display: props.selected ? 'inherit' : 'none'
  }

  const excalidrawButtonProps = {
    type: 'text',
    size: 'small',
    color: 'neutral'
  }
  return (
    <>
      <div style={styleObj} ref={containerRef}>
        <button onClick={toggleZenMode}> Zen{getZenMode() ? '(On)' : '(Off)'} </button>
        <button onClick={toggleGridMode}> Grid{getGridMode() ? '(On)' : '(Off)'} </button>
        <button onClick={toggleReadView}> Read-Only{getReadView() ? '(On)' : '(Off)'} </button>
        {/* <div
          ref={dataDragHandleRef}
          className="drag-handle"
          contentEditable="false"
          draggable="true"
          data-drag-handle
          style={dragHandlerStyle}
        /> */}
        <ResizableView
          aspectRatio={ResizableRatioType.Flexible}
          initialSize={{ width: width, height: height }}
          onResizing={(e, newWidth, newHeight): void => {
            if (!containerRef.current) {
              return
            }
            if (newHeight) {
              containerRef.current.parentElement.style.height = newHeight + 'px'
            }
            if (newWidth) {
              containerRef.current.parentElement.style.width = newWidth + 'px'
            }
            if (newWidth || newHeight) {
              containerRef.current.parentElement.style.aspectRatio = `${newHeight} / ${newHeight}`
            }
          }}
          onResized={(e, newWidth, newHeight): void => {
            props.updateAttributes({ width: newWidth, height: newHeight })
          }}
        >
          <Excalidraw
            initialData={initialData}
            onChange={dataUpdate}
            zenModeEnabled={zenMode}
            gridModeEnabled={gridMode}
            viewModeEnabled={readOnly}
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
              <MainMenu.Group title={'Theme'}>
                <MainMenu.DefaultItems.ToggleTheme />
                <MainMenu.DefaultItems.ChangeCanvasBackground />
              </MainMenu.Group>
            </MainMenu>
          </Excalidraw>
        </ResizableView>
      </div>
    </>
  )
}
