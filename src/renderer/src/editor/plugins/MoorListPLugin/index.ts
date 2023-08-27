import {
  COMMAND_PRIORITY_LOW,
  INSERT_PARAGRAPH_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DOWN_COMMAND,
  KEY_TAB_COMMAND
} from 'lexical'
import { ReactNode, useEffect } from 'react'
import { mergeRegister } from '@lexical/utils'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  handleListItemShiftTab,
  handleListItemTab
} from '@renderer/editor/plugins/MoorListPLugin/utils'
import {
  INSERT_MOOR_ORDERED_LIST_COMMAND,
  INSERT_MOOR_UNORDERED_LIST_COMMAND,
  INSERT_MOOR_CHECK_LIST_COMMAND,
  REMOVE_MOOR_LIST_COMMAND
} from './commands'
import {
  $handleListInsertParagraph,
  insertList,
  removeList
} from '@renderer/editor/node/MoorList/utils'

export function MoorListPlugin(): ReactNode {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_MOOR_ORDERED_LIST_COMMAND,
        () => {
          insertList(editor, 'number')
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        INSERT_MOOR_UNORDERED_LIST_COMMAND,
        () => {
          insertList(editor, 'bullet')
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        INSERT_MOOR_CHECK_LIST_COMMAND,
        () => {
          insertList(editor, 'check')
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        REMOVE_MOOR_LIST_COMMAND,
        () => {
          removeList(editor)
          return true
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        (event: KeyboardEvent): boolean => {
          
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (event: KeyboardEvent): boolean => {
          return handleListItemTab(event)
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event: KeyboardEvent): boolean => {
          if (event.key === 'Tab' && event.shiftKey) {
            return handleListItemShiftTab(event)
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        INSERT_PARAGRAPH_COMMAND,
        () => {
          const hasHandledInsertParagraph = $handleListInsertParagraph()

          if (hasHandledInsertParagraph) {
            return true
          }

          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor])
  return null
}
