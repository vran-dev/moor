import { LinkAttributes } from '@lexical/link'
import { LexicalCommand, createCommand } from 'lexical'

export const OPEN_LINK_EDITOR: LexicalCommand<string | ({ url: string } & LinkAttributes) | null> =
  createCommand('OPEN_LINK_EDITOR')
