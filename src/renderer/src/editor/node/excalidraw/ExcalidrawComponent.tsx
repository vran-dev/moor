import { Excalidraw, MainMenu } from '@excalidraw/excalidraw'
import {
  AppState,
  BinaryFiles,
  ExcalidrawAPIRefValue,
  ExcalidrawImperativeAPI
} from '@excalidraw/excalidraw/types/types'
import { $getNodeByKey, NodeKey } from 'lexical'
import { useState, useRef, useEffect, useMemo } from 'react'
import { $isExcalidrawNode, ExcalidrawNode, ExcalidrawOptions } from '.'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import './Excalidraw.css'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import useModal from '@renderer/ui/Modal/useModal'
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
import { ResizableRatioType, ResizableView } from '@renderer/ui/ResizableView'

export default function ExcalidrawComponent(props: {
  data: string
  options: ExcalidrawOptions
  nodeKey: NodeKey
}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { nodeKey } = props
  const { width, height, zenEnabled, gridEnabled, readOnlyEnabled } = props.options
  const [selected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  const [modalActive, setModalActive] = useState(false)

  const dataUpdate = async (elements, state, files): Promise<void> => {
    // notice: state.collaborators should be a array ,but export to object
    state.collaborators = []
    // ignore appState, because it is cause cursor conflict with lexical
    const saveData = {
      elements: elements,
      // appState: state,
      files: files
    }
    const newData = JSON.stringify(saveData)
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
  const [modal, showModal] = useModal(() => setModalActive(false), 'max')

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
        <button
          onClick={(e): void =>
            showModal('Excalidraw', () => {
              setModalActive(true)
              return (
                <ExcalidrawWrapper
                  data={props.data}
                  onChange={(elements, appState, files): void => {
                    dataUpdate(elements, appState, files)
                  }}
                  options={props.options}
                />
              )
            })
          }
          className="excalidraw-toolbar-button"
        >
          {' '}
          Full-Screen
        </button>
        {!modalActive && (
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
            <ExcalidrawWrapper
              data={props.data}
              onChange={(elements, appState, files): void => {
                dataUpdate(elements, appState, files)
              }}
              options={props.options}
              setRef={(api): void => setExcalidrawAPI(api)}
            />
          </ResizableView>
        )}
      </div>
      {modal}
    </>
  )
}

function ExcalidrawWrapper(props: {
  data: string
  options: ExcalidrawOptions
  onChange: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void
  setRef?: (ref: ExcalidrawAPIRefValue) => void
}): JSX.Element {
  const { zenEnabled, gridEnabled, readOnlyEnabled } = props.options
  const { data, onChange, setRef } = props
  const initialData = async () => {
    if (data && data !== '') {
      return JSON.parse(data)
    }
    return null
  }
  return (
    <>
      <Excalidraw
        initialData={initialData()}
        onChange={onChange}
        zenModeEnabled={zenEnabled}
        gridModeEnabled={gridEnabled}
        viewModeEnabled={readOnlyEnabled}
        ref={setRef ? setRef : undefined}
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
    </>
  )
}
