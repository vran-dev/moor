import { Extension } from '@tiptap/react'
import { getSelectionText } from '@renderer/editor/common/prosemirrorSelections'
import { FindPluginState, findPlugin, findPluginKey } from './findPlugin'
import { SearchBoxView, createSearchBoxView } from './findView'

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

export const Find = Extension.create<SearchOption>({
  name: 'find-extension',

  addCommands() {
    let searchBox: SearchBoxView | null = null
    return {
      search:
        (keyword) =>
        (props): boolean => {
          // update input value
          searchBox?.updateTextValue(keyword)
          // dispatch event
          const pluginState = findPluginKey.getState(props.state)
          pluginState.setSearchTerm(keyword)
          pluginState.updating = true
          props.editor.view.dispatch(props.tr)
          pluginState.updating = false
          // update search count
          const findPluginState: FindPluginState = findPluginKey.getState(props.state)
          searchBox?.updateCountSpan(findPluginState.index || 0, findPluginState.total || 0)
          // scroll into view
          const pos = findPluginState.currentMatchPos()
          if (pos) {
            this.editor?.view.domAtPos(pos)?.node.scrollIntoView?.()
          }
          return true
        },
      showSearchPageBox:
        (keyword?: string | null | undefined) =>
        (props): boolean => {
          const searchKey = keyword || getSelectionText(this.editor.view)
          if (searchBox) {
            searchBox.updateTextValue(searchKey)
            searchBox.show()
          } else {
            searchBox = createSearchBoxView(
              searchKey,
              (event) => {
                if (event) {
                  this.editor.commands.search(event.target.value)
                } else {
                  this.editor.commands.search()
                }
              },
              () => {
                this.editor.commands.hideSearchPageBox()
              }
            )
            this.editor.view.dom.parentElement?.parentElement?.insertBefore(
              searchBox.container,
              this.editor.view.dom.parentElement
            )
            searchBox.show()
            // TODO add cancel event
          }
          return true
        },
      hideSearchPageBox:
        () =>
        (props): boolean => {
          if (searchBox) {
            searchBox.hide()
          }
          findPluginKey.getState(props.state).unsetState()
          this.editor.view.focus()
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
        this.editor.view.focus()
        return false
      }
    }
  },

  addProseMirrorPlugins() {
    return [findPlugin()]
  }
})
