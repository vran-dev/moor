import { $getSelection, $isRangeSelection, LexicalEditor, RangeSelection } from 'lexical'
import { getSelectedNode } from './getSelectedNode'
import { $isLinkNode } from '@lexical/link'
import { $isQuoteNode } from '@lexical/rich-text'

export enum FormatType {
  Text = 'text',
  Bold = 'bold',
  Italic = 'italic',
  Underline = 'underline',
  Strikethrough = 'strikethrough',
  Subscript = 'subscript',
  Superscript = 'superscript',
  Code = 'code',
  Link = 'link',
  Quote = 'quote',
}

export function hasFormatAtSelection(editor: LexicalEditor, format: FormatType): boolean {
  return editor.getEditorState().read<boolean>(() => {
    if (editor.isComposing()) {
      return false
    }
    const selection = $getSelection()
    const nativeSelection = window.getSelection()
    const rootElement = editor.getRootElement()

    if (nativeSelection !== null) {
      if (!$isRangeSelection(selection)) {
        return false
      }
      if (rootElement === null) {
        return false
      }
      if (!rootElement.contains(nativeSelection.anchorNode)) {
        return false
      }
    }

    const rangeSelection = selection as RangeSelection
    const node = getSelectedNode(rangeSelection)
    if (format === FormatType.Link) {
      const parent = node.getParent()
      return $isLinkNode(parent) || $isLinkNode(node)
    }
    if (format === FormatType.Quote) {
      const parent = node.getParent()
      return $isQuoteNode(parent) || $isQuoteNode(node)
    }
    return rangeSelection.hasFormat(format.valueOf())
  })

  // if (!$isCodeHighlightNode(selection.anchor.getNode()) && selection.getTextContent() !== '') {
  //   setIsText($isTextNode(node))
  // } else {
  //   setIsText(false)
  // }

  // const rawTextContent = selection.getTextContent().replace(/\n/g, '')
  // if (!selection.isCollapsed() && rawTextContent === '') {
  //   setIsText(false)
  //   return
  // }
}
