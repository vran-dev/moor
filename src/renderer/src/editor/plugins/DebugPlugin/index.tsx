import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { BLUR_COMMAND, COMMAND_PRIORITY_HIGH, FOCUS_COMMAND, KEY_DOWN_COMMAND } from 'lexical'

import * as React from 'react'

export default function DebugPlugin(): null {
  const [editor] = useLexicalComposerContext()
  React.useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (payload): boolean => {
          console.log('KEY_DOWN_COMMAND', payload)
          return false
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        BLUR_COMMAND,
        (payload): boolean => {
          console.log('BLUR_COMMAND', payload)
          return false
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        FOCUS_COMMAND,
        (payload): boolean => {
          console.log('FOCUS_COMMAND', payload)
          return false
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  }, [])
  return null
}
