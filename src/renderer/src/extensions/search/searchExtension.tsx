import { Extension } from '@tiptap/react'
import { SearchBoxView, SearchMeta, createSearchBoxView, searchPluginInit } from './searchPlugin'
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
        (props): boolean => {
          if (keyword) {
            searchBox?.updateTextValue(keyword)
          }
          const meta: SearchMeta = {
            searchKey: keyword,
            direction: 'next',
            callback: (state) => {
              searchBox?.updateCountSpan(state.currentMatchIndex, state.totalMatchCount)
            }
          }
          props.dispatch?.(props.state.tr.setMeta('search', meta))
          return true
        },
      showSearchPageBox:
        (keyword?: string | null | undefined) =>
        (props): boolean => {
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
            searchBox.show()
          }
          props.dispatch?.(props.state.tr.setMeta('searching', true))
          return true
        },
      hideSearchPageBox:
        () =>
        (props): boolean => {
          if (searchBox) {
            searchBox.hide()
            this.editor.commands.search(null)
          }
          props.dispatch?.(props.state.tr.setMeta('searching', false))
          return true
        }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-f': (): boolean => {
        const searchKey = getSelectionText(this.editor.view)
        this.editor.commands.showSearchPageBox()
        if (searchKey) {
          this.editor.commands.search(searchKey)
        }
        return true
      },
      Escape: (): boolean => {
        this.editor.commands.hideSearchPageBox()
        return false
      }
    }
  },

  addProseMirrorPlugins() {
    return [searchPluginInit(this.editor)]
  }
})
