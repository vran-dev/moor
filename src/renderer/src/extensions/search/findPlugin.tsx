import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet, DecorationSource } from 'prosemirror-view'
import { Node } from 'prosemirror-model'

export class FindPluginState {
  searchTerm: string | null | undefined
  isSearchTermChanged = false
  updating = false
  index = 0
  total = 0
  direction?: 'next' | 'prev'
  matches: Decoration[] = []
  searchTermHistory: string[] = []

  setSearchTerm(newTerm: string | null | undefined): void {
    if (this.searchTerm === newTerm) {
      this.isSearchTermChanged = false
      return
    }
    if (this.searchTerm) {
      this.searchTermHistory = [
        this.searchTerm,
        ...this.searchTermHistory.filter((term) => term !== this.searchTerm)
      ]
    }
    this.isSearchTermChanged = true
    this.searchTerm = newTerm
  }

  unsetState(): void {
    this.update([], 0)
    this.searchTermHistory = []
    this.searchTerm = null
    this.isSearchTermChanged = false
  }

  update(matches: Decoration[], newIndex?: number): void {
    this.matches = matches
    this.total = matches?.length || 0
    if (newIndex && this.total > 0) {
      this.index = Math.max(newIndex, 0) % this.total
    }
    if (this.total != 0) {
      // FIXME index may greater than totle if doc changed (delete middle match term)
      this.updateIndex(0, this.index)
    }
  }

  updateIndex(prevIndex: number, newIndex: number): void {
    if (!this.total) {
      return
    }
    this.index = newIndex % this.total
    const currentMatch = this.matches[this.index]
    const prevMatch = this.matches[prevIndex]
    if (prevMatch) {
      this.matches[prevIndex] = Decoration.inline(prevMatch.from, prevMatch.to, {
        class: `search-match`
      })
    }
    if (currentMatch) {
      this.matches[this.index] = Decoration.inline(currentMatch.from, currentMatch.to, {
        class: `search-match active`
      })
    }
  }

  nextIndex(): void {
    this.updateIndex(this.index, this.index + 1)
  }

  currentMatchPos(): number | null {
    const currentMatch = this.matches[this.index]
    return currentMatch ? currentMatch.from : null
  }

  decorationSet(doc: Node): DecorationSet {
    return DecorationSet.create(doc, this.matches || [])
  }
}

const _find = (
  doc: Node,
  searchKeyword: string | null | undefined,
  matchClassName: string
): Decoration[] => {
  interface MergedTextNode {
    text: string
    from: number
  }
  if (!searchKeyword || searchKeyword === '') {
    return []
  }

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
  mergedTextNodes.forEach((mergedTextNode) => {
    let index = -1
    // match all searchKeyword text use indexOf
    const text = mergedTextNode.text.toLowerCase()
    const searchKey = searchKeyword.toLowerCase()
    while ((index = text.indexOf(searchKey, index + 1)) != -1) {
      const from = mergedTextNode.from + index
      const to = from + searchKey.length
      const decoration = Decoration.inline(from, to, { class: matchClassName })
      if (decoration) {
        searchMatches.push(decoration)
      }
    }
  })
  return searchMatches
}

export const findPluginKey = new PluginKey('find-plugin-key')

export const findPlugin = (): Plugin => {
  return new Plugin({
    key: findPluginKey,
    state: {
      init: () => new FindPluginState(),
      apply(tr, state: FindPluginState): FindPluginState {
        if (!state.updating) {
          return state
        }

        if (state.searchTerm) {
          if (tr.docChanged || state.isSearchTermChanged) {
            const decorations = _find(tr.doc, state.searchTerm, 'search-match')
            if (state.isSearchTermChanged) {
              // should reset index when term changed
              state.update(decorations, 0)
            } else {
              state.update(decorations)
              state.nextIndex()
            }
          } else {
            state.nextIndex()
          }
          state.isSearchTermChanged = false
          return state
        }
        if (tr.docChanged) {
          const decorations = state.decorationSet(tr.doc).map(tr.mapping, tr.doc).find()
          state.update(decorations, 0)
          return state
        } else {
          return state
        }
      }
    },
    props: {
      decorations(state): DecorationSource | null | undefined {
        const curr = this.getState(state)
        if (!curr || !curr?.searchTerm || !curr?.matches.length) {
          return null
        }

        const decorations = curr.matches.filter((m) => m != null)
        return DecorationSet.create(state.doc, decorations)
      }
    }
  })
}
