import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $getSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
  createCommand
} from 'lexical'
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils'
import { useEffect } from 'react'
import { $createCalloutNextNode } from '@renderer/editor/node/CalloutNext'

export const INSERT_CALLOUT_COMMAND = createCommand<void>()
export default function ÇalloutPlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_CALLOUT_COMMAND,
        () => {
          editor.update(() => {
            const calloutNode = $createCalloutNextNode().append($createParagraphNode())
            $insertNodeToNearestRoot(calloutNode)
            calloutNode.select()
          })
          return true
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor])
  return null
}
