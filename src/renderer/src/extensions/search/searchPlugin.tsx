import { Plugin, PluginSpec } from '@tiptap/pm/state'
import { Decoration, DecorationSet, EditorView, DecorationSource } from '@tiptap/pm/view'
import { Node } from '@tiptap/pm/model'
import { Editor } from '@tiptap/core'

const search = (doc: Node, searchKeyword: string | null | RegExp | undefined): DecorationSet => {
  interface MergedTextNode {
    text: string
    from: number
  }
  if (!searchKeyword || searchKeyword === '') {
    return DecorationSet.empty
  }

  const regex = searchKeyword instanceof RegExp ? searchKeyword : new RegExp(searchKeyword, 'gi')
  const mergedTextNodes: MergedTextNode[] = []
  let index = 0
  doc.descendants((node, pos) => {
    const mergedTextNode = mergedTextNodes[index]
    if (!node.isText && mergedTextNode) {
      index += 1
      return
    }
    if (node.isText) {
      if (mergedTextNode) {
        mergedTextNodes[index] = {
          text: mergedTextNode.text + (node.text ? node.text : ''),
          from: mergedTextNode.from
        }
      } else {
        mergedTextNodes.push({
          text: node.text ? node.text : '',
          from: pos
        })
      }
    }
  })

  const searchMatches: Decoration[] = []
  let active = false
  mergedTextNodes.forEach((mergedTextNode) => {
    let match
    while ((match = regex.exec(mergedTextNode.text))) {
      const from = mergedTextNode.from + match.index
      const to = from + match[0].length
      if (active) {
        searchMatches.push(Decoration.inline(from, to, { class: 'search-match' }))
      } else {
        searchMatches.push(Decoration.inline(from, to, { class: 'search-match active' }))
        active = true
      }
    }
  })
  return DecorationSet.create(doc, searchMatches)
}

export type SearchPluginOption = PluginSpec<SearchPluginState>

export interface SearchMeta {
  searchKey?: string | null
  direction?: 'next' | 'prev'
  callback?: (option: SearchPluginState) => void
}

class SearchPlugin extends Plugin<SearchPluginState> {
  option: SearchPluginOption

  constructor(option: SearchPluginOption) {
    super(option)
    this.option = option
  }

  searchByKeyword = (
    view: EditorView,
    keyword: string | null | undefined,
    callback?: (option: SearchPluginOption) => void
  ): void => {
    const state: SearchPluginState | undefined = this.getState(view.state)
    let searchMethod: string
    if (keyword && state?.searchKey === keyword) {
      searchMethod = 'next'
    } else {
      searchMethod = 'search'
    }
    if (!state) {
      return
    }
    state.searchKey = keyword
    state.updating = true
    view.dispatch(view.state.tr.setMeta('search', searchMethod))
    state.updating = false
    if (callback) {
      callback(state)
    }
  }
}

export class SearchPluginState {
  updating = false
  currentMatchIndex = 0
  totalMatchCount = 0
  searchKey: string | null | undefined
  editor: Editor | null | undefined
  matches: DecorationSet | null | undefined
  searching = false

  updateMatches(matches: DecorationSet | undefined, currentMatchIndex?: number): void {
    this.matches = matches
    this.totalMatchCount = matches?.find()?.length || 0
    this.currentMatchIndex = currentMatchIndex || -1
  }

  static empty: SearchPluginState = new SearchPluginState()

  static create(
    editor: Editor,
    searchKey?: string | null | undefined,
    matches?: DecorationSet | undefined | null
  ): SearchPluginState {
    const state = new SearchPluginState()
    state.searchKey = searchKey
    state.editor = editor
    state.currentMatchIndex = -1
    state.totalMatchCount = matches?.find()?.length || 0
    state.matches = matches
    return state
  }
}

export const searchPluginInit = (editor: Editor): SearchPlugin => {
  return new SearchPlugin({
    name: 'search',
    state: {
      init(): SearchPluginState {
        return SearchPluginState.create(editor)
      },

      apply(tr, value, oldState, newState): SearchPluginState {
        if (tr.getMeta('searching')) {
          value.searching = tr.getMeta('searching')
        }
        if (value.updating) {
          return value
        }
        if (tr.docChanged && value.searching) {
          const newMatches = search(tr.doc, value.searchKey)
          value.updateMatches(newMatches, value.currentMatchIndex)
          return value
        }
        const searchMeta: SearchMeta = tr.getMeta('search')
        if (!searchMeta) {
          return value
        }
        value.updating = true
        if (searchMeta.searchKey === null) {
          value.updateMatches(DecorationSet.empty)
          value.updating = false
          return value
        }

        // update if searchKey changed
        if (value.searchKey !== searchMeta.searchKey || tr.docChanged) {
          value.searchKey = searchMeta.searchKey
          value.updateMatches(search(tr.doc, searchMeta.searchKey))
        }

        const direction = searchMeta.direction
        if (direction === 'next') {
          const decorations = value.matches?.find() || []
          const nextIndex =
            (value.currentMatchIndex == -1 ? 0 : value.currentMatchIndex + 1) % decorations.length
          const next = decorations[nextIndex]
          const prev = decorations[Math.max(value.currentMatchIndex, 0)]
          const newDecorations = decorations.map((d) => {
            if (d.from === next.from && d.to === next.to) {
              return Decoration.inline(d.from, d.to, { class: 'search-match active' })
            } else if (d.from === prev.from && d.to === prev.to) {
              return Decoration.inline(d.from, d.to, { class: 'search-match' })
            }
            return d
          })
          value.matches = DecorationSet.create(tr.doc, newDecorations)
          value.currentMatchIndex = nextIndex
          if (next) {
            value.editor?.view.domAtPos(next.from)?.node.scrollIntoView?.()
          }
        } else {
          const matches = search(tr.doc, value.searchKey)
          value.updateMatches(matches)
        }
        if (searchMeta.callback) {
          searchMeta.callback(value)
        }
        value.updating = false
        return value
      }
    },

    props: {
      decorations(state): DecorationSource | null | undefined {
        return this.getState(state)?.matches
      }
    }
  })
}

export class SearchBoxView {
  container: HTMLElement
  input: HTMLInputElement
  countSpan: HTMLSpanElement

  constructor(container: HTMLElement, input: HTMLInputElement, countSpan: HTMLSpanElement) {
    this.container = container
    this.input = input
    this.countSpan = countSpan
  }

  show(): void {
    this.container.style.display = 'block'
    this.input.focus()
  }

  hide(): void {
    this.container.style.display = 'none'
  }

  updateTextValue(value: string): void {
    this.input.value = value ? value : ''
  }

  updateCountSpan(currentMatchIndex: number, totalMatchCount: number): void {
    if (!totalMatchCount) {
      this.countSpan.innerHTML = ''
      return
    }
    if (totalMatchCount == 0) {
      this.countSpan.innerHTML = '0/0'
      return
    }
    this.countSpan.innerHTML = `${currentMatchIndex + 1}/${totalMatchCount}`
  }
}

const searchIconSvg = `<svg
className="icon"
viewBox="0 0 1024 1024"
version="1.1"
xmlns="http://www.w3.org/2000/svg"
width="16"
height="16"
>
<path
  d="M883.2 823.466667L665.6 605.866667C704 554.666667 725.333333 492.8 725.333333 426.666667c0-164.266667-134.4-298.666667-298.666666-298.666667S128 262.4 128 426.666667s134.4 298.666667 298.666667 298.666666c66.133333 0 128-21.333333 179.2-59.733333l217.6 217.6c17.066667 17.066667 42.666667 17.066667 59.733333 0 17.066667-17.066667 17.066667-42.666667 0-59.733333zM213.333333 426.666667c0-117.333333 96-213.333333 213.333334-213.333334s213.333333 96 213.333333 213.333334-96 213.333333-213.333333 213.333333-213.333333-96-213.333334-213.333333z"
  fill="#999999"
></path>
</svg>`

export const createSearchBoxView = (
  defaultValue: string | null,
  find: (event) => void
): SearchBoxView => {
  const wrapper = document.createElement('div')
  wrapper.classList.add('search-page-box')

  const iconContainer = document.createElement('div')
  iconContainer.classList.add('search-page-box-icon')
  iconContainer.innerHTML = searchIconSvg
  wrapper.appendChild(iconContainer)

  const input = document.createElement('input')
  input.type = 'text'
  input.classList.add('search-page-box-input')
  input.placeholder = 'Search in page'
  input.addEventListener('input', find)
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && wrapper.style.display !== 'none') {
      find(event)
      return
    }
    if (event.key === 'Escape') {
      wrapper.style.display = 'none'
      find(null)
      return
    }
  })
  input.value = defaultValue || ''
  wrapper.appendChild(input)

  const countSpan = document.createElement('span')
  countSpan.classList.add('search-page-box-count')
  countSpan.innerText = ''
  wrapper.appendChild(countSpan)
  return new SearchBoxView(wrapper, input, countSpan)
}
