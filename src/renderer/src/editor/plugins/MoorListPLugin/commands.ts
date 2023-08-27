import type { LexicalCommand } from 'lexical'
import { createCommand } from 'lexical'

export const INSERT_MOOR_UNORDERED_LIST_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_MOOR_UNORDERED_LIST_COMMAND'
)
export const INSERT_MOOR_ORDERED_LIST_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_MOOR_ORDERED_LIST_COMMAND'
)
export const INSERT_MOOR_CHECK_LIST_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_MOOR_CHECK_LIST_COMMAND'
)
export const REMOVE_MOOR_LIST_COMMAND: LexicalCommand<void> = createCommand(
  'REMOVE_MOOR_LIST_COMMAND'
)
