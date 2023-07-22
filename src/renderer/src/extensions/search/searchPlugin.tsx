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

export interface SearchPluginOption extends PluginSpec<DecorationSet> {
  setEditor: (editor: Editor) => void
  getEditor: () => Editor | null
  setUpdating: (updating: boolean) => void
  setSearchKeyword: (searchKeyword: string | null | undefined) => void
  getSearchKeyword: () => string | null | undefined
}

class SearchPlugin extends Plugin {
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
    let searchMethod: string
    if (keyword && this.option.getSearchKeyword() === keyword) {
      searchMethod = 'next'
    } else {
      searchMethod = 'search'
    }
    this.option.setSearchKeyword(keyword)
    this.option.setUpdating(true)
    view.dispatch(view.state.tr.setMeta('search', searchMethod))
    this.option.setUpdating(false)
    if (callback) {
      callback(this.option)
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
}

const searchPluginInit = (): SearchPlugin => {
  let updating = false
  let searchKeyword: string | null | undefined = null
  let editor: Editor | null = null
  let currentMatchIndex = 0
  let totalMatchCount = 0
  let matches: DecorationSet | null
  return new SearchPlugin({
    name: 'search',
    state: {
      init(): DecorationSet {
        return DecorationSet.empty
      },

      apply(tr, value, oldState, newState): DecorationSet {
        if (updating) {
          const method = tr.getMeta('search')
          if (method === 'search' || totalMatchCount === 0) {
            matches = search(tr.doc, searchKeyword)
            totalMatchCount = matches?.find()?.length || 0
            currentMatchIndex = 0
          } else if (method === 'next') {
            //next
            const decorations = matches?.find() || []
            const nextIndex = (currentMatchIndex + 1) % decorations.length
            const next = decorations[nextIndex]
            const prev = decorations[currentMatchIndex]
            const newDecorations = decorations.map((d) => {
              if (d.from === next.from && d.to === next.to) {
                return Decoration.inline(d.from, d.to, { class: 'search-match active' })
              } else if (d.from === prev.from && d.to === prev.to) {
                return Decoration.inline(d.from, d.to, { class: 'search-match' })
              }
              return d
            })
            matches = DecorationSet.create(tr.doc, newDecorations)
            currentMatchIndex = nextIndex
            editor?.view.domAtPos(next.from)?.node.scrollIntoView?.(true)
          } else {
            // prev
          }
          return matches
        }

        if (tr.docChanged) {
          return value.map(tr.mapping, tr.doc)
        }

        return value
      }
    },

    setUpdating(updatingValue: boolean): void {
      updating = updatingValue
    },

    setSearchKeyword(searchKeywordValue: string | null | undefined): void {
      searchKeyword = searchKeywordValue
    },

    getSearchKeyword(): string | null | undefined {
      return searchKeyword
    },

    getTotalMatchCount(): number {
      return totalMatchCount
    },

    getCurrentMatchIndex(): number {
      return currentMatchIndex
    },

    setEditor(editorValue: Editor): void {
      editor = editorValue
    },

    getEditor(): Editor | null {
      return editor
    },

    props: {
      decorations(state): DecorationSource | null | undefined {
        return this.getState(state)
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
    if (event.key === 'Enter') {
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

export const searchPlugin = searchPluginInit()
