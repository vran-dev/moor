import { Excalidraw, MainMenu } from '@excalidraw/excalidraw'
import { ExcalidrawAPIRefValue } from '@excalidraw/excalidraw/types/types'
import { ResizableRatioType, ResizableView } from '@renderer/components/resize/resizableViewContent'
import { $getNodeByKey, NodeKey } from 'lexical'
import { useState, useRef, useEffect, useMemo } from 'react'
import { $isExcalidrawNode, ExcalidrawNode, ExcalidrawOptions } from '.'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import './Excalidraw.css'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'

export default function ExcalidrawComponent(props: {
  data: string
  options: ExcalidrawOptions
  nodeKey: NodeKey
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPIRefValue | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { nodeKey } = props
  const { width, height, zenEnabled, gridEnabled, readOnlyEnabled } = props.options
  const [selected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)

  const initialData = useMemo(async () => {
    if (props.data && props.data !== '') {
      return JSON.parse(props.data)
    }
    return null
  }, [nodeKey, props.data])

  useEffect(() => {
    if (excalidrawAPI) {
      excalidrawAPI
    }
  }, [excalidrawAPI])

  const dataUpdate = async (elements, state, files): Promise<void> => {
    // notice: state.collaborators should be a array ,but export to object
    state.collaborators = []
    // ignore appState, because it is cause cursor conflict with lexical
    const data = {
      elements: elements,
      // appState: state,
      files: files
    }
    const newData = JSON.stringify(data)
    withExcalidrawNode((node) => {
      if (newData != node.getData()) {
        node.setData(newData)
      }
    })
  }

  const toggleZenMode = (): void => {
    if (excalidrawAPI) {
      const newStatus = !excalidrawAPI.getAppState().zenModeEnabled
      excalidrawAPI.getAppState().zenModeEnabled = newStatus
      withExcalidrawNode((node) => {
        node.setPartialOptions({
          zenEnabled: newStatus
        })
      })
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
      const newStatus = !gridModeEnabled
      withExcalidrawNode((node) => node.setPartialOptions({ gridEnabled: newStatus }))
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

  const toggleReadView = (): void => {
    if (excalidrawAPI) {
      const newStatus = !excalidrawAPI.getAppState().viewModeEnabled
      excalidrawAPI.getAppState().viewModeEnabled = newStatus
      withExcalidrawNode((node) => node.setPartialOptions({ readOnlyEnabled: newStatus }))
    }
  }

  const getReadView = (): boolean => {
    if (excalidrawAPI) {
      return excalidrawAPI.getAppState().viewModeEnabled
    }
    return false
  }

  const withExcalidrawNode = (
    callback: (node: ExcalidrawNode) => void,
    onUpdate?: () => void
  ): void => {
    editor.update(
      () => {
        const node = $getNodeByKey(nodeKey)
        if ($isExcalidrawNode(node)) {
          callback(node)
        }
      },
      { onUpdate }
    )
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
        onMouseDown={() => {
          setSelected(true)
        }}
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
          onResized={(e, newWidth, newHeight): void => {
            if (newWidth) {
              withExcalidrawNode((node) => node.setPartialOptions({ width: newWidth }))
            }
            if (newHeight) {
              withExcalidrawNode((node) => node.setPartialOptions({ height: newHeight }))
            }
          }}
        >
          <Excalidraw
            initialData={initialData}
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
