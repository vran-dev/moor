import { languages } from '@codemirror/language-data'
import { LanguageDescription } from '@codemirror/language'
import { MermaidLanguageInfo } from './Language/MermaidLanguageInfo'

export interface LanguageInfo {
  name: string

  alias: readonly string[]

  description: string | null

  codeMirrorLanguage?: LanguageDescription | null

  preview?: (codeData: string, parent: HTMLElement) => JSX.Element
}

export const codeMirrorLanguageInfos: LanguageInfo[] = languages.map(
  (lang: LanguageDescription) => {
    return {
      name: lang.name,
      alias: lang.alias,
      description: '',
      codeMirrorLanguage: lang
    }
  }
)

export const extendedLanguageInfos: LanguageInfo[] = [
  {
    name: 'Plain',
    alias: ['text'],
    description: 'plain text',
    codeMirrorLanguage: null
  }
]

export const languageInfos = [
  ...codeMirrorLanguageInfos,
  ...extendedLanguageInfos,
  new MermaidLanguageInfo()
]

export const listLanguages = ({
  query,
  nameFullMatch = false
}: {
  query: string
  nameFullMatch?: boolean
}): LanguageInfo[] => {
  if (!query || query === '') {
    return languageInfos
  }
  return languageInfos.filter((item) => languageMatch(query, nameFullMatch, item))
}

export const languageMatch = (
  query: string,
  nameFullMatch: boolean,
  languageInfo: LanguageInfo
): boolean => {
  if (!query || query === '') {
    return true
  }
  if (nameFullMatch) {
    return languageInfo.name.toLowerCase() === query.toLowerCase()
  }
  return (
    languageInfo.name.toLowerCase().includes(query.toLowerCase()) ||
    languageInfo.description?.toLowerCase().includes(query.toLowerCase()) ||
    languageInfo.alias.includes(query.toLowerCase())
  )
}
