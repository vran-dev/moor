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
  }
})
