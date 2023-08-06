import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import * as React from 'react'
import { MARKDOWN_TRANSFORMERS } from './MarkdownTransform'

export default function MarkdownPlugin(): JSX.Element {
  return <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
}
