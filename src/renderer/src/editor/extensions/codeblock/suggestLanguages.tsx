import { languages } from '@codemirror/language-data'
import { LanguageDescription } from '@codemirror/language'
import { CommandProps } from '../suggestion/suggestComponent'
import { MermaidLanguageBlock } from './mermaidLanguageBlock'

export interface LanguageBlock {
  name: string

  alias: readonly string[]

  description: string | null

  command: ({ editor, range }: CommandProps) => void

  lang?: LanguageDescription | null

  updateLivePreview?: (id: string, parent: HTMLElement, content: string) => void

  hideLivePreview?: (id: string) => void
}

const items: LanguageBlock[] = languages.map((lang: LanguageDescription) => {
  return {
    name: lang.name,
    alias: lang.alias,
    description: '',
    lang: lang,
    command: ({ editor, range }: CommandProps): void => {
      editor.chain().focus().deleteRange(range).setCodeBlock({ language: lang.name }).run()
    }
  }
})

items.push({
  name: 'Plain',
  alias: ['text'],
  description: '',
  command: ({ editor, range }: CommandProps): void => {
    editor.chain().focus().deleteRange(range).setCodeBlock({ language: 'Plain' }).run()
  }
})

items.push(new MermaidLanguageBlock())

export const languageBlocks = items

export const suggestLanguages = ({ query }: { query: string }): LanguageBlock[] => {
  if (!query || query === '') {
    return items
  }
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase()) ||
      item.alias.includes(query.toLowerCase())
  )
}
