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
import { useThrottle } from '@renderer/editor/utils/useThrottle'
import { theme } from 'antd'
import {
  $addUpdateTag,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  EditorState,
  LexicalEditor,
  NodeKey,
  ParagraphNode,
  SerializedEditorState,
  createEditor
} from 'lexical'
import { useEffect, useCallback, useState } from 'react'
import './index.css'
import { ColorPicker } from '../ColorPicker'
import { $isCalloutNode, CalloutNode } from '../..'
import { SelectOption } from '@renderer/ui/Select'
import { useFloating, offset, useHover, useDismiss, useInteractions } from '@floating-ui/react'
import { useDecoratorNodeKeySetting } from '@renderer/editor/utils/useDecoratorNodeKeySetting'
import { focusEditorDom } from '@renderer/editor/utils/focusEditorDom'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { isMultipleSelectino } from '@renderer/editor/utils/isMultipleSelection'
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

  const [showToollMenu, setShowTollMenu] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: showToollMenu,
    onOpenChange: setShowTollMenu,
    placement: 'top-start',
    middleware: [
      offset({
        // crossAxis: -50
      })
    ]
  })
  const hover = useHover(context, {
    move: false
  })
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss])

  return (
    <div
      className="callout-container"
      style={{
        backgroundColor: bgColor
      }}
      ref={refs.setReference}
      {...getReferenceProps()}
    >
      {showToollMenu && (
        <div
          ref={refs.setFloating}
          style={{
            zIndex: 9,
            ...floatingStyles
          }}
          {...getFloatingProps()}
        >
          <ColorPicker
            onChange={(option: SelectOption): void => {
              withCalloutNode((node: CalloutNode) => {
                node.setBgColor(option.value)
              })
            }}
            color={bgColor}
          />
        </div>
      )}

      <NestedEditor nodeKey={nodeKey} state={state} parentEditor={editor} />
    </div>
  )
}

function NestedEditor(props: {
  nodeKey: NodeKey
  parentEditor: LexicalEditor
  state?: SerializedEditorState
}): JSX.Element {
  const { historyState } = useSharedHistoryContext()
  const [selected, setSelected, clearSelection] = useLexicalNodeSelection(props.nodeKey)
  const { parentEditor, nodeKey } = props
  const [calloutEditor, setCalloutEditor] = useState<LexicalEditor>(
    createEditor({
      namespace: 'MoorEditor',
      nodes: [...LexicalNodes],
      onError: (error) => {
        console.log(error)
      },
      theme: theme
    })
  )

  useDecoratorNodeKeySetting(
    {
      editor: parentEditor,
      nodeKey: props.nodeKey,
      onSelect: (): boolean => {
        setSelected(true)
        return true
      },
      primaryHandler: (action: KeyboardEvent): boolean => {
        if (action.key == 'Enter' && (action.ctrlKey || action.metaKey)) {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const anchor = selection.anchor
            const focus = selection.focus
            if (anchor.key === focus.key && anchor.offset === focus.offset) {
              const focusKey = selection.focus.key
              const root = $getRoot()
              const lastChild = root.getLastDescendant()
              if (lastChild && focusKey === lastChild.__key) {
                const editorState = parentEditor.getEditorState()
                const node = editorState._nodeMap.get(nodeKey)
                if (node) {
                  calloutEditor.blur()
                  parentEditor.update(() => {
                    const pNode = new ParagraphNode()
                    node.insertAfter(pNode)
                    pNode.select()
                  })
                  return true
                }
              }
              return false
            }
          }
        }
        return false
      }
    },
    [calloutEditor, parentEditor]
  )
  useEffect(() => {
    if (isMultipleSelectino(parentEditor)) {
      return
    }
    if (selected) {
      focusEditorDom(calloutEditor)
    } else {
      focusEditorDom(parentEditor)
    }
  }, [selected, calloutEditor, parentEditor])

  useEffect(() => {
    /**
     * warning: flushSync was called from inside a lifecycle method.
     *  React cannot flush when React is already rendering.
     *  Consider moving this call to a scheduler task or micro task.
     */
    setTimeout(() => {
      if (!props.state) {
        calloutEditor.setEditorState(calloutEditor.parseEditorState(emptyData))
      } else {
        calloutEditor.setEditorState(calloutEditor.parseEditorState(props.state))
      }
    })
  }, [])

  const updateCalloutNode = useCallback(
    (callback: (node: CalloutNode) => void) => {
      parentEditor.update((): void => {
        const node = $getNodeByKey(props.nodeKey)
        if ($isCalloutNode(node)) {
          callback(node)
        }
      })
    },
    [props.nodeKey]
  )

  const onChange = useThrottle((editorState: EditorState): void => {
    // save editor state
    updateCalloutNode((node: CalloutNode) => {
      // prevent history here, beause it will cause repeated history
      $addUpdateTag('historic')
      node.setChildren(editorState.toJSON())
    })
  }, 1000)

  return (
    <LexicalNestedComposer initialEditor={calloutEditor}>
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
