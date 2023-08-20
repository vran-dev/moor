import { LexicalEditor, TextNode } from 'lexical'
import { $isLinkNode } from '@lexical/link'
import { hasNodeTypeInSelection } from './hasNodeTypeInSelection'

export function hasLinkInSelection(editor: LexicalEditor): boolean {
  return hasNodeTypeInSelection(editor, (node) => {
    return $isLinkNode(node)
  })
}
