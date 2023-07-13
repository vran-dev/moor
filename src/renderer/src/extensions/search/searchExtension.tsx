import { Extension } from '@tiptap/react'
import { searchPlugin } from './searchPlugin'

export interface SearchOption {
  ignoreCase: boolean
}

export const Search = Extension.create<SearchOption>({
  name: 'search',

  addProseMirrorPlugins() {
    return [searchPlugin()]
  }
})
