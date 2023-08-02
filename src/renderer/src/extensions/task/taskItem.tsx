/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { DEFAULT_DATETIME_PATTERN } from '@renderer/common/days'
import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'
import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import dayjs from 'dayjs'

export interface TaskItemOptions {
  onReadOnlyChecked?: (node: ProseMirrorNode, checked: boolean) => boolean
  nested: boolean
  HTMLAttributes: Record<string, any>
}

export const inputRegex = /^\s*(\[([( |x])?\])\s$/

export const chInputRegex = /^\s*(【([( |x])?[】|\]])\s$/

export const TaskItem = Node.create<TaskItemOptions>({
  name: 'taskItem',

  addOptions() {
    return {
      nested: false,
      HTMLAttributes: {}
    }
  },

  content() {
    return this.options.nested ? 'paragraph block*' : 'paragraph+'
  },

  defining: true,

  addAttributes() {
    return {
      checked: {
        default: false,
        keepOnSplit: false,
        parseHTML: (element) => element.getAttribute('data-checked') === 'true',
        renderHTML: (attributes) => ({
          'data-checked': attributes.checked
        })
      },
      createTime: {
        default: null,
        parseHTML: (element) => element.getAttribute('create-time'),
        renderHTML: (attributes) => {
          if (!attributes.createTime) return
          return {
            'create-time': attributes.createTime
          }
        }
      },
      doneTime: {
        default: null,
        parseHTML: (element) => element.getAttribute('done-time'),
        renderHTML: (attributes) => {
          if (!attributes.doneTime) return
          return {
            'done-time': attributes.doneTime
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: `li[data-type="${this.name}"]`,
        priority: 51
      }
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = {
      'data-type': this.name,
      'create-time': node.attrs.createTime
        ? node.attrs.createTime
        : dayjs().format(DEFAULT_DATETIME_PATTERN),
      'done-time': node.attrs.doneTime ? node.attrs.doneTime : undefined
    }

    return [
      'li',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, attrs),
      [
        'label',
        [
          'input',
          {
            type: 'checkbox',
            checked: node.attrs.checked ? 'checked' : null
          }
        ],
        ['span']
      ],
      ['div', 0]
    ]
  },

  addKeyboardShortcuts() {
    const shortcuts = {
      Enter: () => this.editor.commands.splitListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name)
    }

    if (!this.options.nested) {
      return shortcuts
    }

    return {
      ...shortcuts,
      Tab: () => this.editor.commands.sinkListItem(this.name)
    }
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const listItem = document.createElement('li')
      const checkboxWrapper = document.createElement('label')
      const checkboxStyler = document.createElement('span')
      const checkbox = document.createElement('input')
      const content = document.createElement('div')
      const indicator = document.createElement('span')

      checkboxWrapper.contentEditable = 'false'
      checkbox.type = 'checkbox'
      checkbox.addEventListener('change', (event) => {
        // if the editor isn’t editable and we don't have a handler for
        // readonly checks we have to undo the latest change
        if (!editor.isEditable && !this.options.onReadOnlyChecked) {
          checkbox.checked = !checkbox.checked

          return
        }

        const { checked } = event.target as any

        if (editor.isEditable && typeof getPos === 'function') {
          editor
            .chain()
            .focus(undefined, { scrollIntoView: false })
            .command(({ tr }) => {
              const position = getPos()
              const currentNode = tr.doc.nodeAt(position)

              const attr = {
                ...currentNode?.attrs,
                checked: checked,
                doneTime: checked ? dayjs().format(DEFAULT_DATETIME_PATTERN) : null
              }
              tr.setNodeMarkup(position, undefined, attr)

              return true
            })
            .run()
        }
        if (!editor.isEditable && this.options.onReadOnlyChecked) {
          // Reset state if onReadOnlyChecked returns false
          if (!this.options.onReadOnlyChecked(node, checked)) {
            checkbox.checked = !checkbox.checked
          }
        }
      })

      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      listItem.dataset.checked = node.attrs.checked
      if (node.attrs.checked) {
        checkbox.setAttribute('checked', 'checked')
      }
      if (node.attrs.createTime) {
        listItem.setAttribute('create-time', node.attrs.createTime)
      }

      checkboxWrapper.append(checkbox, checkboxStyler)
      listItem.append(checkboxWrapper, content)

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      indicator.contentEditable = 'false'
      indicator.className = 'indicator'

      listItem.append(indicator)
      if (node.attrs.checked && node.attrs.doneTime) {
        indicator.innerHTML = `done time: ${dayjs(node.attrs.doneTime).format(
          DEFAULT_DATETIME_PATTERN
        )}`
      }
      return {
        dom: listItem,
        contentDOM: content,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false
          }

          listItem.dataset.checked = updatedNode.attrs.checked
          if (updatedNode.attrs.checked) {
            checkbox.setAttribute('checked', 'checked')
            if (updatedNode.attrs.doneTime) {
              indicator.innerHTML = `done time: ${updatedNode.attrs.doneTime}`
            }
          } else {
            indicator.innerHTML = ''
            checkbox.removeAttribute('checked')
          }
          if (updatedNode.attrs) {
            if (updatedNode.attrs.doneTime) {
              listItem.setAttribute('done-time', updatedNode.attrs.doneTime)
            } else {
              listItem.removeAttribute('done-time')
            }
            if (updatedNode.attrs.createTime) {
              listItem.setAttribute('create-time', updatedNode.attrs.createTime)
            } else {
              listItem.removeAttribute('create-time')
            }
          }

          if (!updatedNode.attrs.createTime) {
            const attr = {
              ...updatedNode?.attrs,
              createTime: dayjs().format(DEFAULT_DATETIME_PATTERN)
            }
            const tr = editor.view.state.tr.setNodeMarkup(getPos(), undefined, attr)
            editor.view.dispatch(tr)
          }
          return true
        }
      }
    }
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => ({
          checked: match[match.length - 1] === 'x',
          createTime: dayjs().format(DEFAULT_DATETIME_PATTERN),
          doneTime:
            match[match.length - 1] === 'x' ? dayjs().format(DEFAULT_DATETIME_PATTERN) : null
        })
      }),
      wrappingInputRule({
        find: chInputRegex,
        type: this.type,
        getAttributes: (match) => ({
          checked: match[match.length - 1] === 'x',
          createTime: dayjs().format(DEFAULT_DATETIME_PATTERN),
          doneTime:
            match[match.length - 1] === 'x' ? dayjs().format(DEFAULT_DATETIME_PATTERN) : null
        })
      })
    ]
  }
})
