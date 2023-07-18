import { Node } from '@tiptap/pm/model'
import { EditorView, NodeView, Decoration, DecorationSource, DecorationSet } from '@tiptap/pm/view'
import { TextSelection, Selection, EditorState, AllSelection } from '@tiptap/pm/state'
import { exitCode } from 'prosemirror-commands'
import { undo, redo } from 'prosemirror-history'
import { EditorView as CodeMirror, keymap as cmKeymap } from '@codemirror/view'
import {
  defaultKeymap,
  history,
  indentWithTab,
  selectAll as cmSelectAll
} from '@codemirror/commands'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  LanguageSupport,
  bracketMatching,
  indentOnInput
} from '@codemirror/language'
import { ViewUpdate, Decoration as CmDecoration } from '@codemirror/view'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import { Compartment } from '@codemirror/state'
import ProsemirrorNodes from '@renderer/common/ProsemirrorNodes'
import { replaceClassEffects } from './codeMirrors'
import { searchPlugin } from '../search/searchPlugin'
import { LanguageBlock, languageBlocks } from './suggestLanguages'
import { v4 as uuid } from 'uuid'
import { selectAll } from 'prosemirror-commands'

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
  id: string

  cm: CodeMirror
  updating: boolean
  LanguageBlocks: LanguageBlock[]
  languageCompartment: Compartment
  languageBlock?: LanguageBlock

  constructor(node, view, getPos) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.id = 'id_' + uuid().replaceAll('-', '')
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
        indentOnInput(),
        autocompletion(),
        // foldGutter(),
        // highlightActiveLine(),
        // drawSelection(),
        history(),
        closeBrackets(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle),
        this.languageCompartment.of([]),
        CodeMirror.updateListener.of((update: ViewUpdate) => this.forwardUpdate(update))
      ]
    })

    this.LanguageBlocks = languageBlocks
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
    // This flag is used to avoid an update loop between the outer and
    // inner editor
    this.updating = false
    if (this.languageBlock?.updateLivePreview) {
      this.languageBlock.updateLivePreview(this.id, this.dom, this.node.textContent)
    }
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
      if (update.changes.empty) {
        return
      }
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
    lang: string | null | undefined,
    matched: (LanguageSupport: LanguageSupport) => void,
    noMatch?: (lang: string) => void
  ): void {
    if (!lang) {
      return
    }
    const block = this.LanguageBlocks.find(
      (block) => block.name.toLowerCase() === lang.toLowerCase()
    )
    if (!block) {
      noMatch && noMatch(lang)
      return
    }

    if (block.lang) {
      if (block.lang.support) {
        matched(block.lang.support)
      } else {
        block.lang.load().then((support: LanguageSupport) => {
          matched(support)
        })
      }
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
        key: 'Mod-a',
        run: (): boolean => {
          const ranges = this.cm.state.selection.ranges
          if (ranges.length > 1 || !ranges[0]) {
            return false
          }
          const selection = ranges[0]
          const { anchor, head } = selection
          if (anchor === 0 && head === this.cm.state.doc.length) {
            this.view.focus()
            selectAll(this.view.state, this.view.dispatch, this.view)
          } else {
            // first select all codeblock area
            cmSelectAll(this.cm)
          }
          return true
        }
      },
      {
        key: 'Ctrl-f',
        mac: 'Cmd-f',
        run: (): boolean => {
          const ranges = this.cm.state.selection.ranges
          if (ranges.length > 1) {
            searchPlugin.option.getEditor()?.commands.showSearchPageBox()
            return false
          }
          const selection = ranges[0]
          if (!selection) {
            searchPlugin.option.getEditor()?.commands.showSearchPageBox()
            return true
          }
          const searchString = this.cm.state.doc.sliceString(selection.from, selection.to)
          searchPlugin.option.getEditor()?.commands.showSearchPageBox(searchString)
          if (searchString) {
            searchPlugin.option.getEditor()?.commands.search(searchString)
          }
          return true
        }
      },
      {
        key: 'Escape',
        mac: 'Escape',
        run: (): boolean => {
          searchPlugin.option.getEditor()?.commands.hideSearchPageBox()
          searchPlugin.option.getEditor()?.commands.search()
          return true
        }
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

  update(node: Node, decorations: Decoration[], innerDecoration: DecorationSource): boolean {
    if (node.type != this.node.type) {
      return false
    }
    this.node = node
    if (this.updating) {
      return true
    }
    if (innerDecoration instanceof DecorationSet) {
      const decorationSet = innerDecoration as DecorationSet
      const localDecoraions = decorationSet.find()
      const decorations = localDecoraions.map((decoration: Decoration) => {
        return { from: decoration.from, to: decoration.to }
      })
      const classes = decorations.length ? ['search-match'] : []
      this.updating = true
      replaceClassEffects(this.cm, decorations, classes)
      this.updating = false
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
    if (this.languageBlock?.updateLivePreview) {
      this.languageBlock.updateLivePreview(this.id, this.dom, newText)
    }
    return true
  }

  selectNode(): void {
    this.cm.focus()
  }

  stopEvent(): boolean {
    return true
  }

  destroy(): void {
    if (this.languageBlock?.hideLivePreview) {
      this.languageBlock.hideLivePreview(this.id)
    }
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
