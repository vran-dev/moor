import {
  $addUpdateTag,
  $getNodeByKey,
  EditorState,
  LexicalEditor,
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
import { useDecoratorNodeKeySetting } from '@renderer/editor/utils/useDecoratorNodeKeySetting'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'

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
  const resizeHandlers = useRef([])
  const columnNodeItems = useRef([])
  const columnsContainerRef = useRef<HTMLDivElement | null>(null)
  const [editor] = useLexicalComposerContext()
  const { widthRatio } = props
  const updateColumnsNode = useCallback(
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
  )

  const onMouseDown = useCallback(
    (mouseDownEvent: MouseEvent, index: number): void => {
      mouseDownEvent.preventDefault()
      // add .dragging class
      const ele = mouseDownEvent.target as HTMLDivElement
      ele.classList.add('dragging')
      // save initial position
      const initialX = mouseDownEvent.clientX

      const onMouseMove = (mouseMoveEvent: MouseEvent): void => {
        mouseMoveEvent.preventDefault()
        const currentX = mouseMoveEvent.clientX
        const diffX = currentX - initialX
        // calculate ratio by offset
        const containerWidth = columnsContainerRef.current?.clientWidth || 0
        const offsetRatio = diffX / containerWidth
        // updateColumnWidth(offsetRatio, index)
        const cloneWidthRatio = Array.from(widthRatio)
        cloneWidthRatio[index] += offsetRatio
        cloneWidthRatio[index + 1] -= offsetRatio
        updateColumnsNode((node: ColumnsNode) => {
          node.setWidthRatio(cloneWidthRatio)
        })
      }
      const onMouseUp = (mouseUpEvent: MouseEvent): void => {
        mouseUpEvent.preventDefault()

        // remove .dragging class
        const ele = resizeHandlers.current[index] as HTMLDivElement
        ele.classList.remove('dragging')
        // remove event listener
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [widthRatio]
  )

  const onMouseEnter = useCallback((e: MouseEvent): void => {
    columnNodeItems.current.forEach((ele) => {
      // add .active class
      const target = ele as HTMLDivElement
      if (target != null) {
        target.classList.add('active')
      }
    })
  }, [])
  const onMouseLeave = useCallback((e: MouseEvent): void => {
    columnNodeItems.current.forEach((ele) => {
      // remove .active class
      const target = ele as HTMLDivElement
      if (target != null) {
        target.classList.remove('active')
      }
    })
  }, [])

  const [selected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)

  useDecoratorNodeKeySetting({
    nodeKey: nodeKey,
    editor: editor,
    onSelect: (): boolean => {
      const firstColumnNode = columnNodeItems.current[0]
      if (firstColumnNode) {
        setSelected(true)
        return true
      }
      return false
    }
  })
  return (
    <div
      className="columns-node"
      ref={columnsContainerRef}
      onMouseEnter={(e): void => onMouseEnter(e)}
      onMouseLeave={(e): void => onMouseLeave(e)}
    >
      {Array(count)
        .fill(null)
        .map((_, index) => {
          return (
            <div
              key={index}
              className="columns-item-node"
              style={{
                maxWidth: '100%',
                width: `calc((100% - 20px) * ${widthRatio[index]})`,
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
                  onMouseDown={(e): void => {
                    onMouseDown(e, index)
                  }}
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
    /**
     * warning: flushSync was called from inside a lifecycle method.
     *  React cannot flush when React is already rendering.
     *  Consider moving this call to a scheduler task or micro task.
     */
    setTimeout(() => {
      if (!props.state) {
        columnEditor.setEditorState(columnEditor.parseEditorState(emptyData))
      } else {
        columnEditor.setEditorState(columnEditor.parseEditorState(props.state))
      }
    })
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
