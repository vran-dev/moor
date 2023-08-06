import { HighlightStyle } from '@codemirror/language'
import { mermaidTags, pieTags } from 'codemirror-lang-mermaid'

export const mermaidHighlightStyle = HighlightStyle.define([
  { tag: pieTags.lineComment, color: '#ce9178' },
  { tag: pieTags.number, color: '#131313' },
  { tag: pieTags.showData, color: '#9ECBFF' },
  { tag: pieTags.string, color: '#0055ff' },
  { tag: pieTags.title, color: '#a31515' },
  { tag: pieTags.titleText, color: '#a31515' },
  { tag: pieTags.titleText, color: '#000000' },

  { tag: mermaidTags.diagramName, color: '#a31515' }
])
