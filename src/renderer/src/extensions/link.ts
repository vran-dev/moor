import { InputRule, posToDOMRect } from '@tiptap/core'
import { Plugin } from 'prosemirror-state'
import { TextSelection } from '@tiptap/pm/state'
import Link from '@tiptap/extension-link'
import tippy from 'tippy.js'
import 'tippy.js/themes/light.css'
import { Node } from 'prosemirror-model'

const markdownLinkRegex = /(?<!!)\[(.+?)\]\((\S+?)\)/

export const CustomLink = Link.extend({
  addInputRules() {
    return [
      new InputRule({
        find: markdownLinkRegex,
        handler: (props): void => {
          const { match, range } = props
          const linkName = match[1]
          const linkUrl = match[2]
          const { tr } = props.state
          if (linkName && linkUrl) {
            tr.replaceWith(
              range.from,
              range.to,
              this.editor.schema.text(linkName, [
                this.editor.schema.marks.link.create({ href: linkUrl })
              ])
            ).removeStoredMark(this.type)
          }
        }
      })
    ]
  },

  addProseMirrorPlugins(): Plugin[] {
    return [
      new Plugin({
        view: (editorView) => {
          let pop
          return {
            update: (view, prev): void => {
              const state = view.state
              const { doc, selection } = state
              if (!(selection instanceof TextSelection)) {
                pop?.hide()
                return
              }
              const textSelection = selection as TextSelection
              if (!textSelection.$cursor) {
                pop?.hide()
                return
              }
              const isSame = prev && prev.doc.eq(doc) && prev.selection.eq(selection)
              if (isSame) {
                return
              }
              const cursor = textSelection.$cursor
              if (cursor.pos <= 1) {
                pop?.hide()
                return
              }
              const start = cursor.pos - 1
              const hasLink = doc.rangeHasMark(start, cursor.pos, this.type)
              const node = doc.nodeAt(start)
              const parentPos = doc.resolve(start)
              const parent = parentPos.node()

              let nodeStart = 0
              const cursorOffset = parentPos.parentOffset
              parent.forEach((node: Node, offset: number, index: number) => {
                if (parentPos.parentOffset >= offset) {
                  nodeStart = offset
                }
              })
              const globalStart = parentPos.pos - (cursorOffset - nodeStart)
              const globalEnd = globalStart + node?.nodeSize
              if (hasLink) {
                let href = ''
                const hasMark = (node: Node | null): boolean => {
                  if (!node) {
                    return false
                  }
                  const marks = node.marks
                  if (marks) {
                    return marks.some((mark) => mark.type.name === this.name)
                  }
                  return false
                }
                if (hasMark(node)) {
                  href = node?.marks.find((mark) => mark.type.name === this.name)?.attrs.href
                }

                const ele = document.createElement('div')
                ele.innerHTML = `
                <input class="appearance-none max-w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="url" value="${href}">
                `
                ele.remove()
                ele.style.visibility = 'visible'
                ele.addEventListener('change', (e) => {
                  e.preventDefault()
                  if (!e.target) {
                    return
                  }
                  const value = e.target.value
                  if (!value || value === '') {
                    const newNode = state.schema.text(node?.textContent || '')
                    view.dispatch(state.tr.replaceRangeWith(globalStart, globalEnd, newNode))
                    pop.hide()
                  } else {
                    const newNode = state.schema.text(node?.textContent || '', [
                      this.type.create({ href: value })
                    ])
                    view.dispatch(state.tr.replaceRangeWith(globalStart, globalEnd, newNode))
                    pop.hide()
                  }
                })
                if (pop) {
                  pop.setProps({
                    getReferenceClientRect: () => posToDOMRect(view, start, textSelection.$to.pos)
                  })
                  pop.setContent(ele)
                  pop.show()
                  return
                }
                const { element: editorElement } = this.editor.options
                pop = tippy(editorElement, {
                  content: ele,
                  duration: 0,
                  getReferenceClientRect: () => posToDOMRect(view, start, textSelection.$to.pos),
                  interactive: true,
                  theme: 'light',
                  trigger: 'manual',
                  placement: 'bottom',
                  hideOnClick: 'toggle',
                  maxWidth: 500
                })
                pop.show()
              } else {
                if (pop) {
                  pop.hide()
                }
              }
            }
          }
        }
      })
    ]
  }
})
