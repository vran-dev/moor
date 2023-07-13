import { Node } from '@tiptap/pm/model'
import { EditorView, NodeView } from '@tiptap/pm/view'
import { TextSelection, Selection, EditorState } from '@tiptap/pm/state'
import { EditorView as CodeMirror, keymap as cmKeymap, drawSelection } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  LanguageSupport,
  LanguageDescription
} from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { exitCode } from 'prosemirror-commands'
import { undo, redo } from 'prosemirror-history'
import { ViewUpdate } from '@codemirror/view'
import { closeBrackets } from '@codemirror/autocomplete'
import mermaid from 'mermaid'
import { Compartment, Extension } from '@codemirror/state'
import ProsemirrorNodes from '@renderer/common/ProsemirrorNodes'

export interface CmCommand {
  key: string

  mac?: string

  run: (state: EditorState, dispatch: (tr: any) => void, view: EditorView) => boolean | void
}

interface LanguageBlock {
  name: string

  description?: LanguageDescription | null

  updateLivePreview?: (parent: HTMLElement, content: string) => void

  hideLivePreview?: () => void
}

class MermaidLanguageBlock implements LanguageBlock {
  name = 'Mermaid'
  description = null
  dom?: HTMLElement
  parentDom?: HTMLElement

  updateLivePreview = (parent: HTMLElement, content: string): void => {
    this.parentDom = parent
    if (!this.dom) {
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' })
      const mermaidWrapper = document.createElement('div')
      mermaidWrapper.classList.add('codeblock-preview')
      mermaidWrapper.style.display = 'none'
      this.dom = mermaidWrapper
      parent.appendChild(mermaidWrapper)
    }

    if (this.dom.attributes.getNamedItem('data-processed')) {
      this.dom.attributes.removeNamedItem('data-processed')
    }

    this.dom.innerHTML = content
    if (content) {
      mermaid
        .run({
          nodes: [this.dom]
        })
        .then(() => {
          this.dom.style.display = 'inherit'
        })
        .catch((error) => {
          this.dom.style.display = 'none'
          console.error('reder mermaid failed', error)
        })
    }
  }

  hideLivePreview = (): void => {
    if (this.parentDom && this.dom) {
      this.parentDom.removeChild(this.dom)
      this.dom = undefined
    } else if (this.dom) {
      this.dom.style.display = 'none'
    }
  }
}

export class CodeblockView implements NodeView {
  node: Node
  view: EditorView
  getPos: () => number
  dom: HTMLElement

  cm: CodeMirror
  updating: boolean
  LanguageBlocks: LanguageBlock[]
  languageCompartment: Compartment
  languageBlock?: LanguageBlock

  constructor(node, view, getPos) {
    this.node = node
    this.view = view
    this.getPos = getPos
    // init dom
    const codeBlockWrapper = document.createElement('div')
    codeBlockWrapper.classList.add('codeblock')
    this.dom = codeBlockWrapper

    // init codemirror
    this.languageCompartment = new Compartment()
    this.cm = new CodeMirror({
      doc: this.node.textContent,
      extensions: [
        cmKeymap.of([indentWithTab, ...this.codeMirrorKeymap(), ...defaultKeymap]),
        drawSelection(),
        closeBrackets(),
        syntaxHighlighting(defaultHighlightStyle),
        this.languageCompartment.of([]),
        CodeMirror.updateListener.of((update: ViewUpdate) => this.forwardUpdate(update))
      ]
    })

    this.LanguageBlocks = languages.map((lang: LanguageDescription): LanguageBlock => {
      return { name: lang.name, description: lang }
    })
    this.LanguageBlocks.push({ name: 'Plain' })
    this.LanguageBlocks.push(new MermaidLanguageBlock())
    this.initLanguageSelect()
    this.dom.appendChild(this.cm.dom)
    this.matchLanguage(
      this.node.attrs.language,
      (support) => {
        this.cm.dispatch({
          effects: this.languageCompartment.reconfigure(support)
        })
      },
      (lang) => console.log(lang + ' not found')
    )
    // The editor's outer node is our DOM representation

    // This flag is used to avoid an update loop between the outer and
    // inner editor
    this.updating = false
  }

  forwardUpdate(update: ViewUpdate): void {
    if (this.updating || !this.cm.hasFocus) {
      return
    }
    let offset = this.getPos() + 1
    const cmSelection = update.state.selection.main
    const selFrom = offset + cmSelection.from
    const selTo = offset + cmSelection.to
    const pmSel = this.view.state.selection

    if (update.docChanged || pmSel.from != selFrom || pmSel.to != selTo) {
      const tr = this.view.state.tr
      update.changes.iterChanges((fromA, toA, fromB, toB, text) => {
        if (text.length) {
          const schema = this.view.state.schema
          tr.replaceWith(offset + fromA, offset + toA, schema.text(text.toString()))
        } else {
          tr.delete(offset + fromA, offset + toA)
        }
        offset += toB - fromB - (toA - fromA)
      })
      tr.setSelection(TextSelection.create(tr.doc, selFrom, selTo))
      this.view.dispatch(tr)
      if (this.languageBlock && this.languageBlock.updateLivePreview) {
        const code = this.cm.state.doc.toString()
        this.languageBlock.updateLivePreview(this.dom, code)
      }
    }
  }

  private initLanguageSelect(): void {
    const langSelect = document.createElement('select')
    const selectedLang = this.node.attrs.language || 'Plain'
    this.dom.appendChild(langSelect)

    const langOptions = this.LanguageBlocks.map((langBlock) => {
      const option = document.createElement('option')
      option.value = langBlock.name
      option.text = langBlock.name
      if (langBlock.name.toLowerCase() === selectedLang.toLowerCase()) {
        option.selected = true
      }
      return option
    })
    langOptions
      .sort((a, b) => a.value.localeCompare(b.value))
      .forEach((option) => {
        if (option.value.toLowerCase() === selectedLang.toLowerCase()) {
          option.selected = true
        }
        langSelect.appendChild(option)
      })

    langSelect.addEventListener('change', (event) => {
      event.preventDefault()
      const lang = event.target?.value
      this.matchLanguage(
        lang,
        (support) => {
          this.cm.dispatch({
            effects: this.languageCompartment.reconfigure(support)
          })
        },
        () => {
          this.cm.dispatch({
            effects: this.languageCompartment.reconfigure([])
          })
          ProsemirrorNodes.updateNodeAttributes(this.view, this.getPos, {
            language: 'Plain'
          })
        }
      )
    })
  }

  private matchLanguage(
    lang: string,
    matched: (LanguageSupport: LanguageSupport) => void,
    noMatch?: (lang: string) => void
  ): void {
    const block = this.LanguageBlocks.find(
      (block) => block.name.toLowerCase() === lang.toLowerCase()
    )
    if (!block) {
      noMatch && noMatch(lang)
      return
    }

    if (block.description) {
      if (block.description.support) {
        matched(block.description.support)
      } else {
        block.description.load().then((support: LanguageSupport) => {
          matched(support)
        })
      }
    }

    if (this.languageBlock?.hideLivePreview) {
      this.languageBlock.hideLivePreview()
    }

    if (block.updateLivePreview) {
      block.updateLivePreview(this.dom, this.node.textContent)
    }
    this.languageBlock = block
  }

  setSelection(anchor, head): void {
    this.cm.focus()
    this.updating = true
    this.cm.dispatch({ selection: { anchor, head } })
    this.updating = false
  }

  codeMirrorKeymap(): CmCommand[] {
    const view = this.view
    return [
      { key: 'ArrowUp', run: () => this.maybeEscape('line', -1) },
      { key: 'ArrowLeft', run: () => this.maybeEscape('char', -1) },
      { key: 'ArrowDown', run: () => this.maybeEscape('line', 1) },
      { key: 'ArrowRight', run: () => this.maybeEscape('char', 1) },
      {
        key: 'Ctrl-Enter',
        run: (): boolean => {
          if (!exitCode(view.state, view.dispatch)) return false
          view.focus()
          return true
        }
      },
      {
        key: 'Ctrl-z',
        mac: 'Cmd-z',
        run: () => undo(view.state, view.dispatch)
      },
      {
        key: 'Shift-Ctrl-z',
        mac: 'Shift-Cmd-z',
        run: () => redo(view.state, view.dispatch)
      },
      {
        key: 'Ctrl-y',
        mac: 'Cmd-y',
        run: () => redo(view.state, view.dispatch)
      },
      {
        key: 'Backspace',
        run: (): boolean => {
          const ranges = this.cm.state.selection.ranges

          if (ranges.length > 1) {
            return false
          }

          const selection = ranges[0]

          if (selection && (!selection.empty || selection.anchor > 0)) {
            return false
          }

          // We don't want to convert a multi-line code block into a paragraph
          // because newline characters are invalid in a paragraph node.
          if (this.cm.state.doc.lines >= 2) {
            return false
          }

          const state = this.view.state
          // const toggleNode = assertGet(state.schema.nodes, this.toggleName)
          // const toggleNode = state.schema.nodes[this.toggleName]
          const pos = this.getPos()
          const node = state.tr.doc.nodeAt(pos)
          console.log(node)
          console.log(view.state.schema.nodes.paragraph)
          const tr = node
            ? state.tr.replaceWith(
                pos,
                pos + node.nodeSize,
                view.state.schema.nodes.paragraph.createChecked({}, this.node.content)
              )
            : state.tr
          tr.setSelection(TextSelection.near(tr.doc.resolve(pos)))
          this.view.dispatch(tr)
          this.view.focus()
          return true
        }
      }
    ]
  }

  maybeEscape(unit, dir): boolean {
    const { state } = this.cm
    let { main } = state.selection
    if (!main.empty) {
      return false
    }
    if (unit == 'line') {
      main = state.doc.lineAt(main.head)
    }
    if (dir < 0 ? main.from > 0 : main.to < state.doc.length) {
      return false
    }
    const targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize)
    const selection = Selection.near(this.view.state.doc.resolve(targetPos), dir)
    const tr = this.view.state.tr.setSelection(selection).scrollIntoView()
    this.view.dispatch(tr)
    this.view.focus()
    return true
  }

  update(node): boolean {
    if (node.type != this.node.type) {
      return false
    }
    this.node = node
    if (this.updating) {
      return true
    }
    const newText = node.textContent,
      curText = this.cm.state.doc.toString()
    if (newText != curText) {
      let start = 0,
        curEnd = curText.length,
        newEnd = newText.length
      while (start < curEnd && curText.charCodeAt(start) == newText.charCodeAt(start)) {
        ++start
      }
      while (
        curEnd > start &&
        newEnd > start &&
        curText.charCodeAt(curEnd - 1) == newText.charCodeAt(newEnd - 1)
      ) {
        curEnd--
        newEnd--
      }
      this.updating = true
      this.cm.dispatch({
        changes: {
          from: start,
          to: curEnd,
          insert: newText.slice(start, newEnd)
        }
      })
      this.updating = false
    }
    return true
  }

  selectNode(): void {
    this.cm.focus()
  }

  stopEvent(): boolean {
    return true
  }
}

// function arrowHandler(dir) {
//   return (state, dispatch, view) => {
//     if (state.selection.empty && view.endOfTextblock(dir)) {
//       const side = dir == 'left' || dir == 'up' ? -1 : 1
//       const $head = state.selection.$head
//       const nextPos = Selection.near(
//         state.doc.resolve(side > 0 ? $head.after() : $head.before()),
//         side
//       )
//       if (nextPos.$head && nextPos.$head.parent.type.name == 'code_block') {
//         dispatch(state.tr.setSelection(nextPos))
//         return true
//       }
//     }
//     return false
//   }
// }

// const arrowHandlers = keymap({
//   ArrowLeft: arrowHandler('left'),
//   ArrowRight: arrowHandler('right'),
//   ArrowUp: arrowHandler('up'),
//   ArrowDown: arrowHandler('down')
// })
