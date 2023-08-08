import { $setBlocksType } from '@lexical/selection'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  DEPRECATED_$isGridSelection,
  LexicalEditor
} from 'lexical'
import { FormatType, hasFormatAtSelection } from './hasFormatAtSelection'
import { $createQuoteNode } from '@lexical/rich-text'

export function toggleBlockquote(editor: LexicalEditor): void {
  if (hasFormatAtSelection(editor, FormatType.Quote)) {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  } else {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }
}
