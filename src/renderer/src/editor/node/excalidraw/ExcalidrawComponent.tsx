import { Excalidraw, MainMenu } from '@excalidraw/excalidraw'
import { ExcalidrawAPIRefValue } from '@excalidraw/excalidraw/types/types'
import { ResizableRatioType, ResizableView } from '@renderer/components/resize/resizableViewContent'
import { $getNodeByKey, NodeKey } from 'lexical'
import { ReactNode, useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { $isExcalidrawNode, ExcalidrawOptions } from '.'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import './Excalidraw.css'

export const ExcalidrawComponent = (props: {
  data: string
  options: ExcalidrawOptions
  nodeKey: NodeKey
}): ReactNode => {
  const [editor] = useLexicalComposerContext()
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPIRefValue | null>(null)
  const containerRef = useRef(null)
  const [id, setId] = useState('id_' + uuidv4())

  const [zenEnabled, setZenEnabled] = useState(props.options.zenEnabled)
  const [gridEnabled, setGridEnabled] = useState(props.options.gridEnabled)
  const [readOnlyEnabled, setReadOnlyEnabled] = useState(props.options.readOnlyEnabled)
  const [width, setWidth] = useState(props.options.width)
  const [height, setHeight] = useState(props.options.height)
  const [data, setData] = useState(props.data)

  const { nodeKey } = props

  useEffect(() => {
    if (!excalidrawAPI) {
      return
    }
    if (!editor.isEditable()) {
      return
    }
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isExcalidrawNode(node)) {
        node.setOptions({
          zenEnabled: zenEnabled,
          gridEnabled: gridEnabled,
          readOnlyEnabled: readOnlyEnabled,
          width: width,
          height: height
        })
      }
    })
  }, [editor, excalidrawAPI, zenEnabled, gridEnabled, readOnlyEnabled, width, height])

  useEffect(() => {
    if (!editor.isEditable()) {
      return
    }
    if (!excalidrawAPI) {
      return
    }
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isExcalidrawNode(node)) {
        node.setData(data)
      }
    })
  }, [excalidrawAPI, editor, data])

  const dataUpdate = async (elements, state, files): Promise<void> => {
    // notice: state.collaborators should be a array ,but export to object
    state.collaborators = []
    const data = {
      elements: elements,
      appState: state,
      files: files
    }
    const newData = JSON.stringify(data)
    setData(newData)
    return Promise.resolve()
  }

  const toggleZenMode = (): void => {
    if (excalidrawAPI) {
      const newStatus = !excalidrawAPI.getAppState().zenModeEnabled
      excalidrawAPI.getAppState().zenModeEnabled = newStatus
      setZenEnabled(newStatus)
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
        setGridEnabled(true)
      } else {
        excalidrawAPI.getAppState().gridModeEnabled = true
        excalidrawAPI.getAppState().gridSize = 20
        setGridEnabled(false)
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
      setReadOnlyEnabled(newStatus)
    }
  }

  const getReadView = (): boolean => {
    if (excalidrawAPI) {
      return excalidrawAPI.getAppState().viewModeEnabled
    }
    return false
  }

  return (
    <>
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          paddingTop: '8px',
          paddingBottom: '8px'
        }}
        ref={containerRef}
      >
        <button onClick={toggleZenMode} className="excalidraw-toolbar-button">
          {' '}
          Zen{getZenMode() ? '(On)' : '(Off)'}{' '}
        </button>
        <button onClick={toggleGridMode} className="excalidraw-toolbar-button">
          {' '}
          Grid{getGridMode() ? '(On)' : '(Off)'}{' '}
        </button>
        <button onClick={toggleReadView} className="excalidraw-toolbar-button">
          {' '}
          Read-Only{getReadView() ? '(On)' : '(Off)'}{' '}
        </button>
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
          onResized={(e, newWidth, newHeight): void => {}}
        >
          <Excalidraw
            initialData={JSON.parse(data)}
            onChange={dataUpdate}
            zenModeEnabled={zenEnabled}
            gridModeEnabled={gridEnabled}
            viewModeEnabled={readOnlyEnabled}
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
