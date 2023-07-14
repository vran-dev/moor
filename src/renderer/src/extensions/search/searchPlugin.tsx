import { Plugin } from '@tiptap/pm/state'
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view'
import { Node } from '@tiptap/pm/model'

export const searchPlugin = (): Plugin => {
  return new Plugin({
    state: {
      init() {
        return DecorationSet.empty
      },

      apply(tr, value, oldState, newState) {
        const meta = tr.getMeta('search')
        if (meta && meta.decorationSet) {
          return meta.decorationSet
        }
        return value
      }
    },

    props: {
      handleKeyDown(view, event): boolean | void {
        // 处理快捷键 command+f 或者 ctrl+f
        if (event.key === 'f' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault()
          // 这里只处理选中的文案进行搜索
          if (view.state.selection.empty) {
            console.log('请选中文案后再搜索')
            return false
          }

          const range = view.state.selection
          const { from, to } = range
          const searchString = view.state.doc.textBetween(from, to)
          const regex = new RegExp(searchString, 'gi')
          const decorationSet = search(view.state.doc, regex)
          view.dispatch(view.state.tr.setMeta('search', { decorationSet }))
        }
      },

      decorations(state) {
        return this.getState(state)
      }
    }
  })
}

const search = (doc: Node, regex): DecorationSet => {
  interface MergedTextNode {
    text: string
    from: number
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
    let match
    while ((match = regex.exec(mergedTextNode.text))) {
      const from = mergedTextNode.from + match.index
      const to = from + match[0].length
      searchMatches.push(Decoration.inline(from, to, { class: 'search-match' }))
    }
  })
  return DecorationSet.create(doc, searchMatches)
}

export const searchKeyword = (view: EditorView, keyword: string): void => {
  const regex = new RegExp(keyword, 'gi')
  const decorationSet = search(view.state.doc, regex)
  view.dispatch(view.state.tr.setMeta('search', { decorationSet }))
}
