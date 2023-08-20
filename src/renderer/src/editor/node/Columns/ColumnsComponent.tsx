import {
  $addUpdateTag,
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  EditorState,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditorState,
  createEditor
} from 'lexical'
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer'
import { useSharedHistoryContext } from '@renderer/editor/context/SharedHistoryContext'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import LexicalNodes from '..'
import theme from '../../theme/default'
import { EditorPlugins } from '@renderer/editor'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useThrottle } from '@renderer/editor/utils/useThrottle'
import { $isColumnNode, ColumnsNode } from '.'
import './index.css'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { throttle } from 'lodash-es'

const emptyData: SerializedEditorState = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      }
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1
  }
}

export function ColumnWidthResizer(): JSX.Element {
  return <div className="columns-node-resizer"></div>
}

export function ColumnsComponent(props: {
  count: number
  widthRatio: Array<number>
  nodeKey: NodeKey
  states?: Array<SerializedEditorState>
}): JSX.Element {
  const { count, nodeKey, states } = props
  const [widthRatio, setWidthRatio] = useState<Array<number>>(props.widthRatio)
  const resizeHandlers = useRef([])
  const columnNodeItems = useRef([])
  const columnsContainerRef = useRef<HTMLDivElement | null>(null)
  const [editor] = useLexicalComposerContext()

  const updateColumnsNode = useThrottle(
    useCallback(
      (callback: (node: ColumnsNode) => void) => {
        editor.update((): void => {
          const node = $getNodeByKey(props.nodeKey)
          if ($isColumnNode(node)) {
            $addUpdateTag('historic')
            callback(node)
          }
        })
      },
      [props.nodeKey]
    ),
    250
  )
  useEffect(() => {
    if (!widthRatio) {
      return
    }
    // updateColumnsNode((node: ColumnsNode) => {
    //   node.setWidthRatio(widthRatio)
    // })
  }, [widthRatio])

  useEffect(() => {
    if (!columnsContainerRef.current) {
      return
    }
    if (resizeHandlers.current.length == 0 || columnNodeItems.current.length == 0) {
      return
    }

    const destroyList: (() => void)[] = []
    resizeHandlers.current.forEach((handler, index) => {
      const ele = handler as HTMLDivElement
      const onMouseDown = (mouseDownEvent: MouseEvent): void => {
        mouseDownEvent.preventDefault()
        // add .dragging class
        const ele = resizeHandlers.current[index] as HTMLDivElement
        ele.classList.add('dragging')

        // save initial position
        const initialX = mouseDownEvent.clientX
        const containerWidth = columnsContainerRef.current?.clientWidth || 0
        const onMouseMove = (mouseMoveEvent: MouseEvent): void => {
          mouseMoveEvent.preventDefault()
          console.log('moving')
          const currentX = mouseMoveEvent.clientX
          const diffX = currentX - initialX
          // calculate ratio by offset
          const offsetRatio = diffX / containerWidth
          const cloneWidthRatio = Array.from(widthRatio)
          cloneWidthRatio[index] += offsetRatio
          cloneWidthRatio[index + 1] -= offsetRatio
          setWidthRatio(cloneWidthRatio)
        }
        const onMouseUp = (mouseUpEvent: MouseEvent): void => {
          mouseUpEvent.preventDefault()
          // remove .dragging class
          const ele = resizeHandlers.current[index] as HTMLDivElement
          ele.classList.remove('dragging')
          console.log('remove dragging event')
          updateColumnsNode((node: ColumnsNode) => {
            node.setWidthRatio(widthRatio)
          })
          // remove event listener
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
        }
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
        destroyList.push(() => document.removeEventListener('mousemove', onMouseMove))
        destroyList.push(() => document.removeEventListener('mouseup', onMouseUp))
      }
      ele.addEventListener('mousedown', onMouseDown)
      destroyList.push(() => ele.removeEventListener('mousedown', onMouseDown))
    })
    return () => {
      console.log('destroy.....')
      destroyList.forEach((destroy) => {
        destroy()
      })
    }
  }, [columnsContainerRef, resizeHandlers, columnNodeItems, widthRatio])
  return (
    <div className="columns-node" ref={columnsContainerRef}>
      {Array(count)
        .fill(null)
        .map((_, index) => {
          return (
            <div
              key={index}
              className="columns-item-node"
              style={{
                width: `calc((100%-20px)*${widthRatio[index]})`,
                flexGrow: 1
              }}
              ref={(ele): void => {
                columnNodeItems.current[index] = ele
              }}
            >
              <Column nodeKey={nodeKey} index={index} state={states?.[index]}></Column>
              {index !== count - 1 && (
                <div
                  className="columns-node-resizer"
                  ref={(ele): void => {
                    resizeHandlers.current[index] = ele
                  }}
                ></div>
              )}
            </div>
          )
        })}
    </div>
  )
}

function Column(props: {
  nodeKey: NodeKey
  index: number
  state?: SerializedEditorState
}): JSX.Element {
  const { historyState } = useSharedHistoryContext()
  const [rootEditor] = useLexicalComposerContext()

  const columnEditor: LexicalEditor = createEditor({
    namespace: 'MoorEditor',
    nodes: [...LexicalNodes],
    onError: (error) => {
      console.log(error)
    },
    theme: theme
  })

  useEffect(() => {
    if (!props.state) {
      columnEditor.setEditorState(columnEditor.parseEditorState(emptyData))
    } else {
      columnEditor.setEditorState(columnEditor.parseEditorState(props.state))
    }
  }, [])

  const updateColumnNode = useCallback(
    (callback: (node: ColumnsNode) => void) => {
      rootEditor.update((): void => {
        const node = $getNodeByKey(props.nodeKey)
        if ($isColumnNode(node)) {
          callback(node)
        }
      })
    },
    [props.nodeKey]
  )

  const onChange = useThrottle((editorState: EditorState): void => {
    // save editor state
    updateColumnNode((node) => {
      // prevent history here, beause it will cause repeated history
      $addUpdateTag('historic')
      node.replaceChildren(props.index, editorState.toJSON())
    })
  }, 1000)

  return (
    <LexicalNestedComposer initialEditor={columnEditor}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="editor"
            spellCheck={false}
            style={{
              width: '100%'
            }}
          />
        }
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin externalHistoryState={historyState} />
      <OnChangePlugin onChange={onChange} ignoreSelectionChange />
      <EditorPlugins enableHistory={false} />
    </LexicalNestedComposer>
  )
}
