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
  $createNodeSelection,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  EditorState,
  ElementNode,
  KEY_DOWN_COMMAND,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  ParagraphNode,
  SerializedEditorState,
  createEditor
} from 'lexical'
import { useEffect, useCallback, useState, useLayoutEffect } from 'react'
import './index.css'
import { ColorPicker } from '../ColorPicker'
import { $isCalloutNode, CalloutNode } from '../..'
import { SelectOption } from '@renderer/ui/Select'
import { useFloating, offset, useHover, useDismiss, useInteractions } from '@floating-ui/react'
import { useDecoratorNodeKeySetting } from '@renderer/editor/utils/useDecoratorNodeKeySetting'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { isMultipleSelectino } from '@renderer/editor/utils/isMultipleSelection'

import {
  focusEditorDom,
  getNodeByEditor,
  isAtBottomLine,
  isAtHeadLine,
  isEmptyParagraph,
  isSingleRangeSelection
} from '@renderer/editor/utils/EditorHelper'

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
      onSelect: (event: KeyboardEvent): boolean => {
        if (event.key === 'ArrowUp') {
          calloutEditor.focus(() => {}, { defaultSelection: 'rootEnd' })
          return true
        }
        setSelected(true)
        return true
      },
      primaryHandler: (event: KeyboardEvent): boolean => {
        if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
          return handleParentArrowKey(event, calloutEditor, parentEditor, nodeKey)
        }
        return false
      }
    },
    [calloutEditor, parentEditor]
  )

  useEffect(() => {
    return calloutEditor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent): boolean => {
        if (event.key == 'Enter' && (event.ctrlKey || event.metaKey)) {
          return handleCalloutCtrlEnter(event, calloutEditor, parentEditor, nodeKey)
        }
        if (event.key == 'Enter') {
          return handleCalloutEnter(event, calloutEditor, parentEditor, nodeKey)
        }
        if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
          return handleCalloutArrowKeyfunction(event, calloutEditor, parentEditor, nodeKey)
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [calloutEditor, parentEditor])

  useEffect(() => {
    if (isMultipleSelectino(parentEditor)) {
      return
    }
    if (selected) {
      // parentEditor.blur()
      // delay focus, because of editor may not render yet when create
      setTimeout(() => {
        focusEditorDom(calloutEditor)
      }, 10)
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

function handleParentArrowKey(
  event: KeyboardEvent,
  editor: LexicalEditor,
  parentEditor: LexicalEditor,
  nodeKey: NodeKey
): boolean {
  const selection = $getSelection()
  if ($isNodeSelection(selection) && selection.getNodes().length === 1) {
    const currentNode = selection.getNodes()[0]
    let prepareToSelect: LexicalNode | null | ElementNode = null
    if (event.key == 'ArrowUp') {
      prepareToSelect = currentNode.getPreviousSibling()
    } else {
      prepareToSelect = currentNode.getNextSibling()
    }

    if (prepareToSelect && prepareToSelect.__key == nodeKey) {
      event.preventDefault()
      const defSelection = event.key == 'ArrowUp' ? 'rootEnd' : 'rootStart'
      parentEditor.blur()
      editor.focus(() => {}, { defaultSelection: defSelection })
      return true
    }
  }
  return false
}

function handleCalloutArrowKeyfunction(
  event: KeyboardEvent,
  editor: LexicalEditor,
  parentEditor: LexicalEditor,
  nodeKey: NodeKey
): boolean {
  // jump from callout editor to parent editor
  if (isSingleRangeSelection(editor)) {
    if (isAtHeadLine(editor) && event.key == 'ArrowUp') {
      parentEditor.update((): void => {
        const calloutNode = getNodeByEditor(parentEditor, nodeKey)
        let prepareToSelect = calloutNode?.getPreviousSibling()
        if (prepareToSelect) {
          if (prepareToSelect instanceof ElementNode) {
            event.preventDefault()
            prepareToSelect.select()
          } else {
            const ns = $createNodeSelection()
            ns.add(prepareToSelect.__key)
            event.preventDefault()
            editor.blur()
            focusEditorDom(parentEditor)
            $setSelection(ns)
          }
        }
      })
      return true
    }

    if (isAtBottomLine(editor) && event.key == 'ArrowDown') {
      parentEditor.update((): void => {
        const calloutNode = getNodeByEditor(parentEditor, nodeKey)
        let prepareToSelect = calloutNode?.getNextSibling()
        if (prepareToSelect) {
          if (prepareToSelect instanceof ElementNode) {
            event.preventDefault()
            prepareToSelect.select()
          } else {
            const ns = $createNodeSelection()
            ns.add(prepareToSelect.__key)
            event.preventDefault()
            editor.blur()
            focusEditorDom(parentEditor)
            $setSelection(ns)
          }
        }
      })
    }
    return false
  }
  return false
}

function handleCalloutCtrlEnter(
  event: KeyboardEvent,
  editor: LexicalEditor,
  parentEditor: LexicalEditor,
  nodeKey: NodeKey
): boolean {
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
          event.preventDefault()
          editor.blur()
          parentEditor.update(() => {
            const pNode = new ParagraphNode()
            node.insertAfter(pNode)
            pNode.select()
          })
          return true
        }
      }
    }
  }
  return false
}

function handleCalloutEnter(
  event: KeyboardEvent,
  editor: LexicalEditor,
  parentEditor: LexicalEditor,
  nodeKey: NodeKey
): boolean {
  const selection = $getSelection()
  if ($isRangeSelection(selection)) {
    const anchor = selection.anchor
    const focus = selection.focus
    if (anchor.key === focus.key && anchor.offset === focus.offset) {
      const focusKey = selection.focus.key
      const root = $getRoot()
      const lastChild = root.getLastDescendant()
      // in the last line
      if (lastChild && focusKey === lastChild.__key) {
        const prev = lastChild.getPreviousSibling()
        if (isEmptyParagraph(prev) && isEmptyParagraph(lastChild)) {
          event.preventDefault()
          editor.blur()
          const editorState = parentEditor.getEditorState()
          const node = editorState._nodeMap.get(nodeKey)
          parentEditor.update(() => {
            const pNode = new ParagraphNode()
            node?.insertAfter(pNode)
            pNode.select()
          })
          setTimeout(() => {
            editor.update(() => {
              lastChild.remove()
              prev?.remove()
            })
          })
          return true
        }
      }
    }
  }
  return false
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
