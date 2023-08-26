import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { COMMAND_PRIORITY_LOW, createCommand } from 'lexical'
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils'
import { useEffect } from 'react'
import { $createCalloutNode } from '@renderer/editor/node/Callout'

export const INSERT_CALLOUT_COMMAND = createCommand<void>()
export default function ÇalloutPlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_CALLOUT_COMMAND,
        () => {
          editor.update(() => {
            const calloutNode = $createCalloutNode()
            $insertNodeToNearestRoot(calloutNode)
          })
          return true
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor])
  return null
}
