import { languages } from '@codemirror/language-data'
import { LanguageDescription } from '@codemirror/language'
import { CommandProps } from '../slash/slashComponent'

const items = languages.map((lang: LanguageDescription) => {
  return {
    title: lang.name,
    alias: lang.alias,
    description: '',
    command: ({ editor, range }: CommandProps): void => {
      editor.chain().focus().deleteRange(range).setCodeBlock({ language: lang.name }).run()
    }
  }
})

export const suggestionLanguages = ({ query }: { query: string }) => {
  if (!query || query === '') {
    return items
  }
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.alias.includes(query.toLowerCase())
  )
}
