/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { MarkdownSerializer } from 'prosemirror-markdown'
import { Node, Mark, Fragment } from 'prosemirror-model'

export const customMarkdownSerializer = new MarkdownSerializer(
  {
    blockquote(state, node) {
      state.wrapBlock('> ', null, node, () => state.renderContent(node))
    },
    codeBlock(state, node) {
      // Make sure the front matter fences are longer than any dash sequence within it
      const backticks = node.textContent.match(/`{3,}/gm)
      const fence = backticks ? backticks.sort().slice(-1)[0] + '`' : '```'

      state.write(fence + (node.attrs.language || '') + '\n')
      state.text(node.textContent, false)
      // Add a newline to the current content before adding closing marker
      state.write('\n')
      state.write(fence)
      state.closeBlock(node)
    },
    heading(state, node) {
      state.write(state.repeat('#', node.attrs.level) + ' ')
      state.renderInline(node)
      state.closeBlock(node)
    },
    horizontalRule(state, node) {
      state.write(node.attrs.markup || '---')
      state.closeBlock(node)
    },
    bulletList(state, node) {
      state.renderList(node, '  ', () => (node.attrs.bullet || '*') + ' ')
    },
    orderedList(state, node) {
      const start = node.attrs.order || 1
      const maxW = String(start + node.childCount - 1).length
      const space = state.repeat(' ', maxW + 2)
      state.renderList(node, space, (i) => {
        const nStr = String(start + i)
        return state.repeat(' ', maxW - nStr.length) + nStr + '. '
      })
    },
    listItem(state, node) {
      state.renderContent(node)
    },
    paragraph(state, node) {
      state.renderInline(node)
      state.closeBlock(node)
    },
    taskList(state, node) {
      state.renderList(node, '  ', () => (node.attrs.checked ? '[x] ' : '[ ] '))
    },
    taskItem(state, node) {
      state.renderContent(node)
    },
    image(state, node) {
      state.write(
        '![' +
          state.esc(node.attrs.alt || '') +
          '](' +
          node.attrs.src.replace(/[\(\)]/g, '\\$&') +
          (node.attrs.title ? ' "' + node.attrs.title.replace(/"/g, '\\"') + '"' : '') +
          ')'
      )
    },
    hardBreak(state, node, parent, index) {
      for (let i = index + 1; i < parent.childCount; i++)
        if (parent.child(i).type != node.type) {
          state.write('\n')
          return
        }
    },
    text(state, node) {
      state.text(node.text!, !state.inAutolink)
    },
    tableRow(state, node, _, index) {
      let columnCount = 0
      node.forEach((cellNode, _, colIndex) => {
        if (colIndex == 0) {
          state.write('|')
        }

        state.render(cellNode, node, colIndex)
        state.write('|')
        columnCount++
      })
      state.write('\n')
      if (index === 0) {
        for (let i = 0; i < columnCount; i++) {
          state.write('| --- ')
        }
        if (columnCount > 0) {
          state.write('|')
        }
        state.write('\n')
      }
    },
    tableCell(state, node) {
      const fragment: Fragment = node.content
      const child = fragment.firstChild
      if (child) {
        // state.renderInline(child)
        state.wrapBlock('', null, node, () => state.renderContent(node))
      }
    },
    tableHeader(state, node) {
      const fragment: Fragment = node.content
      const child = fragment.firstChild
      if (child) {
        state.renderInline(child)
      }
    },
    table(state, node) {
      const table: string[][] = []
      const colAligns: string[] = []
      node.forEach((rowNode, _, rowIndex) => {
        state.render(rowNode, node, rowIndex)
      })
      state.write('\n')
    }
  },
  {
    italic: { open: '_', close: '*_', mixable: true, expelEnclosingWhitespace: false },
    bold: { open: '**', close: '**', mixable: true, expelEnclosingWhitespace: false },
    strike: { open: '~~', close: '~~', mixable: true, expelEnclosingWhitespace: false },
    underline: { open: '<u>', close: '</U>', mixable: true, expelEnclosingWhitespace: false },
    link: {
      open(state, mark, parent, index) {
        state.inAutolink = isPlainURL(mark, parent, index)
        return state.inAutolink ? '<' : '['
      },
      close(state, mark, parent, index) {
        const { inAutolink } = state
        state.inAutolink = undefined
        return inAutolink
          ? '>'
          : '](' +
              mark.attrs.href.replace(/[\(\)"]/g, '\\$&') +
              (mark.attrs.title ? ` "${mark.attrs.title.replace(/"/g, '\\"')}"` : '') +
              ')'
      },
      mixable: true
    },
    code: {
      open(_state, _mark, parent, index) {
        return backticksFor(parent.child(index), -1)
      },
      close(_state, _mark, parent, index) {
        return backticksFor(parent.child(index - 1), 1)
      },
      escape: false
    }
  }
)

function backticksFor(node: Node, side: number) {
  let ticks = /`+/g,
    m,
    len = 0
  if (node.isText) while ((m = ticks.exec(node.text!))) len = Math.max(len, m[0].length)
  let result = len > 0 && side > 0 ? ' `' : '`'
  for (let i = 0; i < len; i++) result += '`'
  if (len > 0 && side < 0) result += ' '
  return result
}

function isPlainURL(link: Mark, parent: Node, index: number) {
  if (link.attrs.title || !/^\w+:/.test(link.attrs.href)) return false
  const content = parent.child(index)
  if (
    !content.isText ||
    content.text != link.attrs.href ||
    content.marks[content.marks.length - 1] != link
  )
    return false
  return index == parent.childCount - 1 || !link.isInSet(parent.child(index + 1).marks)
}
