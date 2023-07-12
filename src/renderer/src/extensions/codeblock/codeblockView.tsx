import { Node } from '@tiptap/pm/model'
import { EditorView, NodeView } from '@tiptap/pm/view'
import { TextSelection, Selection, EditorState } from '@tiptap/pm/state'
import { EditorView as CodeMirror, keymap as cmKeymap, drawSelection } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle, LanguageSupport } from '@codemirror/language'
import { languages } from '@codemirror/language-data'
import { exitCode } from 'prosemirror-commands'
import { undo, redo } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { ViewUpdate } from '@codemirror/view'
import { closeBrackets } from '@codemirror/autocomplete'
import mermaid from 'mermaid'
import { Compartment, Extension } from '@codemirror/state'

export interface CmCommand {
  key: string

  mac?: string

  run: (state: EditorState, dispatch: (tr: any) => void, view: EditorView) => boolean | void
}

export class CodeblockView implements NodeView {
  node: Node
  view: EditorView
  getPos: () => number
  dom: HTMLElement
  cm: CodeMirror
  updating: boolean
  livePreviewDom?: HTMLElement
  cmExtensions?: Extension[] = []
  languagePacks: LanguageSupport[]

  constructor(node, view, getPos) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.languagePacks = []

    // Create a CodeMirror instance
    const language = new Compartment()
    this.cmExtensions = [
      cmKeymap.of([indentWithTab, ...this.codeMirrorKeymap(), ...defaultKeymap]),
      drawSelection(),
      closeBrackets(),
      syntaxHighlighting(defaultHighlightStyle),
      language.of([]),
      CodeMirror.updateListener.of((update: ViewUpdate) => this.forwardUpdate(update))
    ]

    languages.forEach((lang) => {
      lang.load().then((langModule) => this.languagePacks.push(langModule))
    })

    this.cm = new CodeMirror({
      doc: this.node.textContent,
      extensions: this.cmExtensions
    })

    const switchLang = (lang: string): void => {
      console.log(this.languagePacks)
      const langPack = this.languagePacks.find(
        (langPack) => langPack.language.name.toLowerCase() === lang.toLowerCase()
      )
      if (langPack) {
        this.cm.dispatch({
          effects: language.reconfigure(langPack)
        })
      } else {
        console.log('no lang pack found ' + lang)
        this.cm.dispatch({
          effects: language.reconfigure([])
        })
      }
    }

    const codeBlockWrapper = document.createElement('div')
    codeBlockWrapper.classList.add('codeblock')
    this.dom = codeBlockWrapper

    const langSelect = document.createElement('select')

    const plainOption = document.createElement('option')
    plainOption.value = 'text'
    plainOption.text = 'text'
    langSelect.appendChild(plainOption)

    languages
      .map((lang) => {
        const option = document.createElement('option')
        option.value = lang.name
        option.text = lang.name
        return option
      })
      .forEach((option) => langSelect.appendChild(option))
    langSelect.addEventListener('change', (event) => {
      event.preventDefault()
      switchLang(event.target?.value)
    })
    codeBlockWrapper.appendChild(langSelect)

    codeBlockWrapper.appendChild(this.cm.dom)
    if (node.attrs.language && node.attrs.language === 'mermaid') {
      const mermaidWrapper = document.createElement('div')
      mermaidWrapper.classList.add('codeblock-preview')
      mermaidWrapper.innerHTML = node.textContent
      mermaidWrapper.style.display = 'none'
      this.livePreviewDom = mermaidWrapper
      codeBlockWrapper.appendChild(mermaidWrapper)
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' })
      if (node.textContent) {
        mermaid
          .run({
            nodes: [mermaidWrapper]
          })
          .then(() => {
            this.livePreviewDom.style.display = 'inherit'
          })
          .catch((error) => {
            this.livePreviewDom.style.display = 'none'
            console.error('reder mermaid failed', error)
          })
      }
    }
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
      if (this.livePreviewDom) {
        if (this.livePreviewDom.attributes.getNamedItem('data-processed')) {
          this.livePreviewDom.attributes.removeNamedItem('data-processed')
        }
        this.livePreviewDom.innerHTML = this.cm.state.doc.toString()
        mermaid
          .run({
            nodes: [this.livePreviewDom]
          })
          .then(() => {
            console.log('run......')
            this.livePreviewDom.style.display = 'inherit'
          })
          .catch((error) => {
            this.livePreviewDom.style.display = 'none'
            console.error('reder mermaid failed', error)
          })
      }
    }
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

function arrowHandler(dir) {
  return (state, dispatch, view) => {
    if (state.selection.empty && view.endOfTextblock(dir)) {
      const side = dir == 'left' || dir == 'up' ? -1 : 1
      const $head = state.selection.$head
      const nextPos = Selection.near(
        state.doc.resolve(side > 0 ? $head.after() : $head.before()),
        side
      )
      if (nextPos.$head && nextPos.$head.parent.type.name == 'code_block') {
        dispatch(state.tr.setSelection(nextPos))
        return true
      }
    }
    return false
  }
}

const arrowHandlers = keymap({
  ArrowLeft: arrowHandler('left'),
  ArrowRight: arrowHandler('right'),
  ArrowUp: arrowHandler('up'),
  ArrowDown: arrowHandler('down')
})
