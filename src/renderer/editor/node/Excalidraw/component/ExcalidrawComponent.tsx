import { Excalidraw, MainMenu } from '@excalidraw/excalidraw'
import {
    AppState,
    BinaryFiles,
    ExcalidrawAPIRefValue,
    ExcalidrawImperativeAPI
} from '@excalidraw/excalidraw/types/types'
import { useState, useRef } from 'react'
import { ExcalidrawElement } from '@excalidraw/excalidraw/types/element/types'
import './index.css'
import { EditorView } from 'prosemirror-view'
import { Node } from 'prosemirror-model'
import { useModal } from '@renderer/ui/Modal/useModal'
import { Button } from '@renderer/ui/Button'
import { ResizableRatioType, ResizableView } from '@renderer/ui/ResizableView'
import { updateNodeAttributesPartial } from '@renderer/editor/util/NodeAttributeUtils'

export function ExcalidrawComponent(props: {
    node: Node
    view: EditorView
    getPos: () => number | undefined
}): JSX.Element {
    const [excalidrawAPI, setExcalidrawAPI] =
        useState<ExcalidrawImperativeAPI | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

    const { node, getPos } = props
    const editorView = props.view
    const attrs = node.attrs
    const options: ExcalidrawOptions = {
        zenEnabled: attrs.zenEnabled ?? false,
        gridEnabled: attrs.gridEnabled ?? false,
        readOnlyEnabled: attrs.readOnlyEnabled ?? false,
        width: attrs.width ?? 800,
        height: attrs.height ?? 600,
        data: attrs.data ? JSON.parse(attrs.data) : null
    }

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
        updateNodeAttributesPartial(editorView, getPos, {
            data: newData
        })
    }

    const toggleZenMode = (): void => {
        if (excalidrawAPI) {
            const newStatus = !excalidrawAPI.getAppState().zenModeEnabled
            // @ts-ignore
            excalidrawAPI.getAppState().zenModeEnabled = newStatus
            updateNodeAttributesPartial(editorView, getPos, {
                zenEnabled: newStatus
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
            // @ts-ignore
            const gridModeEnabled = excalidrawAPI.getAppState().gridModeEnabled
            const newStatus = !gridModeEnabled
            updateNodeAttributesPartial(editorView, getPos, {
                gridEnabled: newStatus
            })
            if (gridModeEnabled) {
                // @ts-ignore
                excalidrawAPI.getAppState().gridModeEnabled = false
                // @ts-ignore
                excalidrawAPI.getAppState().gridSize = null
            } else {
                // @ts-ignore
                excalidrawAPI.getAppState().gridModeEnabled = true
                // @ts-ignore
                excalidrawAPI.getAppState().gridSize = 20
            }
        }
    }
    const getGridMode = (): boolean => {
        if (excalidrawAPI) {
            // @ts-ignore
            return excalidrawAPI.getAppState().gridModeEnabled
        }
        return false
    }

    const toggleReadView = (): void => {
        if (excalidrawAPI) {
            const newStatus = !excalidrawAPI.getAppState().viewModeEnabled
            // @ts-ignore
            excalidrawAPI.getAppState().viewModeEnabled = newStatus
            updateNodeAttributesPartial(editorView, getPos, {
                readOnlyEnabled: newStatus
            })
        }
    }

    const getReadView = (): boolean => {
        if (excalidrawAPI) {
            return excalidrawAPI.getAppState().viewModeEnabled
        }
        return false
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
            >
                <div className="excalidraw-tool-menu">
                    <Button onClick={toggleZenMode}>
                        {' '}
                        Zen{getZenMode() ? '(On)' : '(Off)'}{' '}
                    </Button>
                    <Button onClick={toggleGridMode}>
                        {' '}
                        Grid{getGridMode() ? '(On)' : '(Off)'}{' '}
                    </Button>
                    <Button onClick={toggleReadView}>
                        {' '}
                        Read-Only{getReadView() ? '(On)' : '(Off)'}{' '}
                    </Button>
                    <Button
                        onClick={(e): void =>
                            showModal('Excalidraw', () => {
                                setModalActive(true)
                                return (
                                    <ExcalidrawWrapper
                                        onChange={(
                                            elements,
                                            appState,
                                            files
                                        ): void => {
                                            dataUpdate(
                                                elements,
                                                appState,
                                                files
                                            )
                                        }}
                                        options={options}
                                    />
                                )
                            })
                        }
                    >
                        {' '}
                        Full-Screen
                    </Button>
                </div>
                {!modalActive && (
                    <ResizableView
                        aspectRatio={ResizableRatioType.Flexible}
                        initialSize={{
                            width: options.width,
                            height: options.height
                        }}
                        onResized={(e, newWidth, newHeight): void => {
                            const attr = {}
                            if (newWidth) {
                                // @ts-ignore
                                attr.width = newWidth
                            }
                            if (newHeight) {
                                // @ts-ignore
                                attr.height = newHeight
                            }
                            updateNodeAttributesPartial(
                                editorView,
                                getPos,
                                attr
                            )
                        }}
                    >
                        <ExcalidrawWrapper
                            onChange={(elements, appState, files): void => {
                                dataUpdate(elements, appState, files)
                            }}
                            options={options}
                            setRef={(api): void => setExcalidrawAPI(api)}
                        />
                    </ResizableView>
                )}
            </div>
            {modal}
        </>
    )
}

export interface ExcalidrawOptions {
    zenEnabled: boolean
    gridEnabled: boolean
    readOnlyEnabled: boolean
    width: number
    height: number
    data: object
}

function ExcalidrawWrapper(props: {
    options: ExcalidrawOptions
    onChange: (
        elements: readonly ExcalidrawElement[],
        appState: AppState,
        files: BinaryFiles
    ) => void
    setRef?: (ref: ExcalidrawAPIRefValue) => void
}): JSX.Element {
    const { zenEnabled, gridEnabled, readOnlyEnabled } = props.options
    const { onChange, setRef } = props
    const { data } = props.options
    return (
        <>
            <Excalidraw
                initialData={data}
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
