import { Extension } from '@tiptap/react'
import { SearchBoxView, createSearchBoxView, searchPlugin } from './searchPlugin'
import { getSelectionText } from '@renderer/common/prosemirrorSelections'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    search: {
      search: (keyword?: string | null | undefined) => ReturnType
    }
    showSearchPageBox: {
      showSearchPageBox: (keyword?: string | null | undefined) => ReturnType
    }
    hideSearchPageBox: {
      hideSearchPageBox: () => ReturnType
    }
  }
}

export interface SearchOption {
  ignoreCase: boolean
}

export const Search = Extension.create<SearchOption>({
  name: 'search',

  addCommands() {
    let searchBox: SearchBoxView | null = null
    return {
      search:
        (keyword) =>
        ({ commands }): boolean => {
          if (keyword) {
            searchBox?.updateTextValue(keyword)
          }
          searchPlugin.searchByKeyword(this.editor.view, keyword)
          return true
        },
      showSearchPageBox:
        (keyword?: string | null | undefined) =>
        ({ commands }): boolean => {
          const searchKey = keyword || getSelectionText(this.editor.view)
          if (searchBox) {
            searchBox.show()
          } else {
            searchBox = createSearchBoxView(searchKey, (event) => {
              if (event) {
                this.editor.commands.search(event.target.value)
              } else {
                this.editor.commands.search(null)
              }
            })
            this.editor.view.dom.parentElement?.parentElement?.insertBefore(
              searchBox.container,
              this.editor.view.dom.parentElement
            )
          }
          return true
        },
      hideSearchPageBox:
        () =>
        ({ commands }): boolean => {
          if (searchBox) {
            searchBox.hide()
            this.editor.commands.search(null)
          }
          return true
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-f': (): boolean => {
        this.editor.commands.showSearchPageBox()
        const searchKey = getSelectionText(this.editor.view)
        if (searchKey) {
          this.editor.commands.search(searchKey)
        }
        return true
      },
      Escape: (): boolean => {
        this.editor.commands.hideSearchPageBox()
        return true
      }
    }
  },

  addProseMirrorPlugins() {
    searchPlugin.option.setEditor(this.editor)
    return [searchPlugin]
  }
})
