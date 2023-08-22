import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { EditorPlugins } from '@renderer/editor'
import { useSharedHistoryContext } from '@renderer/editor/context/SharedHistoryContext'
import LexicalNodes from '@renderer/editor/node'
import { ColumnsNode, $isColumnNode } from '@renderer/editor/node/Columns'
import { useThrottle } from '@renderer/editor/utils/useThrottle'
import { theme } from 'antd'
import {
  $addUpdateTag,
  $getNodeByKey,
  EditorState,
  LexicalEditor,
  NodeKey,
  SerializedEditorState,
  createEditor
} from 'lexical'
import { useEffect, useCallback } from 'react'
import './index.css'
import { useDecoratorNodeKeySetting } from '@renderer/editor/utils/useDecoratorNodeKeySetting'
import { ColorPicker } from '../ColorPicker'
import { $isCalloutNode, CalloutNode } from '../..'
import { SelectOption } from '@renderer/ui/Select'
export function CalloutComponent(props: {
  bgColor: string
  nodeKey: NodeKey
  state?: SerializedEditorState
}): JSX.Element {
  const { bgColor, nodeKey, state } = props
  const [editor] = useLexicalComposerContext()

  const withCalloutNode = useCallback(
    (callback: (node: CalloutNode) => void) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isCalloutNode(node)) {
          callback(node)
        }
      })
    },
    [nodeKey]
  )

  return (
    <div
      className="callout-container"
      style={{
        backgroundColor: bgColor
      }}
    >
      <ColorPicker
        onChange={(option: SelectOption): void => {
          withCalloutNode((node: CalloutNode) => {
            node.setBgColor(option.value)
          })
        }}
        color={bgColor}
      />
      <NestedEditor nodeKey={nodeKey} state={state} />
    </div>
  )
}

function NestedEditor(props: { nodeKey: NodeKey; state?: SerializedEditorState }): JSX.Element {
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
      // node.replaceChildren(props.index, editorState.toJSON())
    })
  }, 1000)

  return (
    <LexicalNestedComposer initialEditor={columnEditor}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="callout-container-editor"
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
