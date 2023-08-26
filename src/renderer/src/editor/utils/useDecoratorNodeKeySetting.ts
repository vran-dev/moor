import { LexicalEditor, NodeKey } from 'lexical'
import { useArrowKeyOnSelect } from './useArrowKeyOnSelect'
import { useArrowKeyToSelect } from './useArrowKeyToSelect'
import { useEnterKeyOnSelect } from './useEnterKeyOnSelect'

export function useDecoratorNodeKeySetting(
  props: {
    nodeKey: NodeKey
    editor: LexicalEditor
    onSelect: (event: KeyboardEvent) => boolean
    primaryHandler?: (keyAction: KeyboardEvent) => boolean
  },
  observed?: any[]
): void {
  useArrowKeyOnSelect(
    {
      nodeKey: props.nodeKey,
      editor: props.editor,
      primaryHandler: props.primaryHandler
    },
    observed
  )
  useArrowKeyToSelect(
    {
      nodeKey: props.nodeKey,
      editor: props.editor,
      onSelect: props.onSelect,
      primaryHandler: props.primaryHandler
    },
    observed
  )
  useEnterKeyOnSelect(
    {
      nodeKey: props.nodeKey,
      editor: props.editor,
      primaryHandler: props.primaryHandler
    },
    observed
  )
}
