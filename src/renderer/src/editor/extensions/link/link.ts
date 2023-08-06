import { InputRule } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import { LinkInputSelectionPlugin } from './linkInputSelectionPlugin'
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

  addProseMirrorPlugins() {
    return [LinkInputSelectionPlugin({ visible: false, decorations: [] })]
  }
})
